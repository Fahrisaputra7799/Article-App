import 'package:admin/screens/edit_article_screen.dart';
import 'package:admin/screens/login_screen.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: FirebaseOptions(
      apiKey: 'AIzaSyA579feKEOm5ZUKWT32Cg1zmX1b8_z8ux8',
      appId: '1:742936221921:web:6a86cb58d7b37e72ddbfa0',
      messagingSenderId: '742936221921',
      projectId: 'article-app-60905',
    ),
  );
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
      routes: {
        '/edit-article': (context) => const EditArticleScreen(),
      },
    );
  }
}
