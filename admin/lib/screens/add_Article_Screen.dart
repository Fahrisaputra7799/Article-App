import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class AddArticleScreen extends StatefulWidget {
  const AddArticleScreen({super.key});

  @override
  State<AddArticleScreen> createState() => _AddArticleScreenState();
}

class _AddArticleScreenState extends State<AddArticleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _slugController = TextEditingController();
  final _contentController = TextEditingController();
  final _authorController = TextEditingController();

  bool _isLoading = false;

  Future<void> _submitArticle() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await FirebaseFirestore.instance.collection('articles').add({
        'title': _titleController.text.trim(),
        'slug': _slugController.text.trim(),
        'content': _contentController.text.trim(),
        'author': _authorController.text.trim(),
        'createdAt': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Artikel berhasil ditambahkan')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F3F6),
      appBar: AppBar(
        title: const Text('Tambah Artikel'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tulis Artikel Baru',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Isi form berikut untuk menambahkan artikel ke database.',
              style: TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 20),
            Card(
              color: Colors.white,
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      _buildTextField(_titleController, 'Judul Artikel'),
                      _buildTextField(_slugController, 'Slug URL (tanpa spasi)'),
                      _buildTextField(_authorController, 'Penulis'),
                      _buildTextField(
                        _contentController,
                        'Isi Artikel',
                        maxLines: 8,
                      ),
                      const SizedBox(height: 24),
                      _isLoading
                          ? const CircularProgressIndicator()
                          : SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: _submitArticle,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: const Icon(Icons.save),
                                label: const Text('Simpan Artikel'),
                              ),
                            ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        validator: (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.white,
        ),
      ),
    );
  }
}
