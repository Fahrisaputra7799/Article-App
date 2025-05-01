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
  bool _hasChanges = false;

  DocumentReference? _articleRef;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final articleId = ModalRoute.of(context)!.settings.arguments as String?;

    if (articleId == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Article ID tidak valid')));
        Navigator.pop(context);
      });
      return;
    }

    _articleRef = FirebaseFirestore.instance
        .collection('articles')
        .doc(articleId);
    _loadArticleData();
  }

  Future<void> _loadArticleData() async {
    try {
      final doc = await _articleRef!.get();
      final data = doc.data() as Map<String, dynamic>?;

      if (data != null) {
        _titleController.text = data['title'] ?? '';
        _slugController.text = data['slug'] ?? '';
        _authorController.text = data['author'] ?? '';
        _contentController.text = data['content'] ?? '';
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Artikel tidak ditemukan')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal memuat artikel: $e')));
      Navigator.pop(context);
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

      setState(() => _hasChanges = false);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Artikel berhasil diupdate')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal update: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _slugController.dispose();
    _contentController.dispose();
    _authorController.dispose();
    super.dispose();
  }

  void _markChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
    }
  }

  Future<bool> _onWillPop() async {
    if (!_hasChanges) return true;

    final result = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Perubahan belum disimpan'),
            content: const Text(
              'Apakah kamu yakin ingin keluar tanpa menyimpan?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Batal'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Keluar'),
              ),
            ],
          ),
    );

    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Edit Artikel'),
          elevation: 2,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          centerTitle: true,
        ),
        body: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    onChanged: _markChanged,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Edit Informasi Artikel',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildInputField(
                          controller: _titleController,
                          label: 'Judul Artikel',
                          icon: Icons.title,
                        ),
                        const SizedBox(height: 16),
                        _buildInputField(
                          controller: _slugController,
                          label: 'Slug URL',
                          icon: Icons.link,
                        ),
                        const SizedBox(height: 16),
                        _buildInputField(
                          controller: _authorController,
                          label: 'Penulis',
                          icon: Icons.person,
                        ),
                        const SizedBox(height: 16),
                        _buildInputField(
                          controller: _contentController,
                          label: 'Isi Artikel',
                          icon: Icons.article,
                          maxLines: 8,
                          isMultiline: true,
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: _isLoading ? null : _updateArticle,
                            icon: const Icon(Icons.save),
                            label: const Text('Update Artikel'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            if (_isLoading)
              Container(
                color: Colors.black.withOpacity(0.4),
                child: const Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    bool isMultiline = false,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      textInputAction:
          isMultiline ? TextInputAction.newline : TextInputAction.next,
      maxLines: maxLines,
      keyboardType: isMultiline ? TextInputType.multiline : TextInputType.text,
      validator:
          (value) => value == null || value.isEmpty ? 'Wajib diisi' : null,
    );
  }
}
