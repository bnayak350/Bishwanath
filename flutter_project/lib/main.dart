import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'services/currency_formatter.dart';
import 'services/financial_calculator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: MyDailyKhataApp()));
}

class MyDailyKhataApp extends ConsumerStatefulWidget {
  const MyDailyKhataApp({super.key});

  @override
  ConsumerState<MyDailyKhataApp> createState() => _MyDailyKhataAppState();
}

class _MyDailyKhataAppState extends ConsumerState<MyDailyKhataApp> {
  Locale _locale = const Locale('en');

  void setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Daily Khata',
      debugShowCheckedModeBanner: false,
      locale: _locale,
      supportedLocales: const [
        Locale('en', ''),
        Locale('or', ''), // Odia (ଓଡ଼ିଆ)
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF059669), // Emerald
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF059669),
          brightness: Brightness.dark,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Daily Khata (ମୋ ଦୈନିକ ଖାତା)'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.account_balance_wallet, size: 64, color: Color(0xFF059669)),
            const SizedBox(height: 16),
            const Text(
              'Every Rupee Accounted For',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Text(
              'ପ୍ରତ୍ୟେକ ଟଙ୍କାର ହିସାବ',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Text(
              CurrencyFormatter.formatINR(12500000), // ₹1,25,000.00
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
            ),
          ],
        ),
      ),
    );
  }
}
