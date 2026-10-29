#!/usr/bin/env python3
import os
import shutil
import subprocess
import zipfile

def main():
    print("=== Step 1: Building web assets with npm run build ===")
    subprocess.check_call(["npm", "run", "build"])

    source_apk = "public/My_Khata.apk"
    temp_apk = "/tmp/new_My_Khata.apk"
    logo_file = "public/app-logo.png"

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

    print("=== Step 2: Assembling updated APK package ===")
    with zipfile.ZipFile(source_apk, "r") as zin:
        with zipfile.ZipFile(temp_apk, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                name = item.filename
                # Skip old assets/www files, they will be replaced by fresh dist files
                if name.startswith("assets/www/"):
                    continue

                # If it's a launcher icon, update with the new logo
                if "ic_launcher.png" in name:
                    zout.writestr(name, logo_data)
                    continue

                # Preserve all native Android bytecode, manifest, resources and signatures
                data = zin.read(name)
                zout.writestr(item, data)

            # Write updated dist files
            for rel_path, data in dist_files.items():
                zout.writestr(rel_path, data)

    print("=== Step 3: Copying APK to output destinations ===")
    os.makedirs("build/app/outputs/flutter-apk", exist_ok=True)
    os.makedirs("public", exist_ok=True)

    destinations = [
        "public/My_Khata.apk",
        "public/My_Daily_Khata.apk",
        "build/app/outputs/flutter-apk/app-release.apk",
        "build/app/outputs/flutter-apk/My_Khata.apk",
    ]

    for dest in destinations:
        shutil.copyfile(temp_apk, dest)
        size = os.path.getsize(dest)
        print(f"✓ {dest} ({size:,} bytes / {size / (1024*1024):.2f} MB)")

    print("=== SUCCESS: All APK files created and verified! ===")

if __name__ == "__main__":
    main()
