import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class EditArticleScreen extends StatefulWidget {
  const EditArticleScreen({super.key});

  @override
  State<EditArticleScreen> createState() => _EditArticleScreenState();
}

class _EditArticleScreenState extends State<EditArticleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _slugController = TextEditingController();
  final _contentController = TextEditingController();
  final _authorController = TextEditingController();

  bool _isLoading = false;
  DocumentReference? _articleRef;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final articleId = ModalRoute.of(context)!.settings.arguments as String?;

    if (articleId == null) {
      if (mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Article ID tidak valid')),
          );
          Navigator.pop(context);
        });
      }
      return;
    }

    _articleRef = FirebaseFirestore.instance.collection('articles').doc(articleId);
    _loadArticleData();
  }

  Future<void> _loadArticleData() async {
    final doc = await _articleRef!.get();
    final data = doc.data() as Map<String, dynamic>?; // Add ? to allow null

    if (data != null) { // Check if data is not null
      _titleController.text = (data['title'] as String?) ?? '';
      _slugController.text = (data['slug'] as String?) ?? '';
      _authorController.text = (data['author'] as String?) ?? '';
      _contentController.text = (data['content'] as String?) ?? '';
    } else {
      // Handle the case where the document doesn't exist
      // For example, show an error message or navigate back
      print('Article not found!');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Artikel tidak ditemukan')),
        );
        Navigator.pop(context);
      }
      return;
    }
    setState(() {});
  }

  Future<void> _updateArticle() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await _articleRef!.update({
        'title': _titleController.text.trim(),
        'slug': _slugController.text.trim(),
        'author': _authorController.text.trim(),
        'content': _contentController.text.trim(),
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Artikel berhasil diupdate')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal update: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Artikel')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Judul Artikel'),
                validator: (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
              ),
              TextFormField(
                controller: _slugController,
                decoration: const InputDecoration(labelText: 'Slug URL'),
                validator: (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
              ),
              TextFormField(
                controller: _authorController,
                decoration: const InputDecoration(labelText: 'Penulis'),
                validator: (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
              ),
              TextFormField(
                controller: _contentController,
                decoration: const InputDecoration(labelText: 'Isi Artikel'),
                maxLines: 8,
                validator: (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 24),
              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton.icon(
                      onPressed: _updateArticle,
                      icon: const Icon(Icons.save),
                      label: const Text('Update Artikel'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
