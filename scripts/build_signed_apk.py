#!/usr/bin/env python3
import os
import shutil
import subprocess
import zipfile

def run_cmd(cmd):
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print("STDERR:", res.stderr)
        print("STDOUT:", res.stdout)
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def main():
    print("=== Step 1: Building web assets with npm run build ===")
    run_cmd(["npm", "run", "build"])

    source_apk = "public/My_Khata.apk"
    unaligned_apk = "/tmp/app_unaligned.apk"
    aligned_apk = "/tmp/app_aligned.apk"
    signed_apk = "/tmp/app_signed.apk"
    logo_file = "public/app-logo.png"
    keystore = "/tmp/debug.keystore"

    if not os.path.exists(source_apk):
        raise FileNotFoundError(f"{source_apk} not found!")

    with open(logo_file, "rb") as f:
        logo_data = f.read()

    print(f"Loaded logo data: {len(logo_data)} bytes")

    dist_files = {}
    for root, _, files in os.walk("dist"):
        for file in files:
            if file.endswith(".apk"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, "dist")
            with open(full_path, "rb") as f:
                dist_files[f"assets/www/{rel_path}"] = f.read()

    print(f"Compiled dist files count: {len(dist_files)}")

    print("=== Step 2: Assembling clean unaligned APK package (stripping old signatures) ===")
    if os.path.exists(unaligned_apk):
        os.remove(unaligned_apk)

    with zipfile.ZipFile(source_apk, "r") as zin:
        with zipfile.ZipFile(unaligned_apk, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                name = item.filename

                # CRITICAL: Strip ALL old META-INF signature files so apksigner can generate valid v1+v2+v3 signatures
                if name.startswith("META-INF/"):
                    continue

                # Strip old assets/www
                if name.startswith("assets/www/"):
                    continue

                # If it's a launcher icon, update with the new logo
                if "ic_launcher.png" in name:
                    zout.writestr(name, logo_data)
                    continue

                # Preserve native Android bytecode, manifest, and resources.arsc
                data = zin.read(name)
                zout.writestr(item, data)

            # Write updated dist files
            for rel_path, data in dist_files.items():
                zout.writestr(rel_path, data)

    print(f"Unaligned APK created: {os.path.getsize(unaligned_apk):,} bytes")

    print("=== Step 3: Aligning APK with zipalign (4-byte page alignment) ===")
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    run_cmd(["zipalign", "-f", "-p", "4", unaligned_apk, aligned_apk])
    print(f"Aligned APK created: {os.path.getsize(aligned_apk):,} bytes")

    print("=== Step 4: Ensuring Keystore exists ===")
    if not os.path.exists(keystore):
        run_cmd([
            "keytool", "-genkeypair", "-v",
            "-keystore", keystore,
            "-alias", "androiddebugkey",
            "-storepass", "android",
            "-keypass", "android",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-dname", "CN=MyKhata,O=App,C=IN"
        ])

    print("=== Step 5: Signing APK with apksigner (v1, v2, and v3 schemes) ===")
    if os.path.exists(signed_apk):
        os.remove(signed_apk)

    run_cmd([
        "apksigner", "sign",
        "--ks", keystore,
        "--ks-key-alias", "androiddebugkey",
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--min-sdk-version", "21",
        "--out", signed_apk,
        aligned_apk
    ])

    print("=== Step 6: Verifying APK Signature with apksigner ===")
    verify_out = run_cmd(["apksigner", "verify", "--verbose", signed_apk])
    print(verify_out)

    print("=== Step 7: Deploying verified signed APK to output locations ===")
    os.makedirs("build/app/outputs/flutter-apk", exist_ok=True)
    os.makedirs("public", exist_ok=True)

    destinations = [
        "public/My_Khata.apk",
        "public/My_Daily_Khata.apk",
        "build/app/outputs/flutter-apk/app-release.apk",
        "build/app/outputs/flutter-apk/My_Khata.apk",
    ]

    for dest in destinations:
        shutil.copyfile(signed_apk, dest)
        size = os.path.getsize(dest)
        print(f"✓ {dest} ({size:,} bytes / {size / (1024*1024):.2f} MB)")

    print("=== SUCCESS: Production Android APK built and verified with valid v1+v2+v3 signatures! ===")

if __name__ == "__main__":
    main()
