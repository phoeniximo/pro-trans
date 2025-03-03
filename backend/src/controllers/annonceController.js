const Annonce = require('../models/Annonce');

exports.listerAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find().populate('utilisateur', '-password');
    res.json(annonces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.creerAnnonce = async (req, res) => {
  try {
    const annonce = new Annonce({
      utilisateur: req.user.id,
      ...req.body
    });

    const nouvelleAnnonce = await annonce.save();
    res.status(201).json(nouvelleAnnonce);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAnnonceById = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id).populate('utilisateur', '-password');
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    res.json(annonce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.modifierAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    res.json(annonce);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.supprimerAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findOneAndDelete({
      _id: req.params.id,
      utilisateur: req.user.id
    });

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    res.json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};