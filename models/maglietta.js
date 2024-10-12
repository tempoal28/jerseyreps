const mongoose = require('mongoose');

const magliettaSchema = new mongoose.Schema({
  lega: String,
  squadra: String,
  giocatore: String,
  caratteristiche: {
    taglia: String,
    colore: String,
    patch: [String],
    altreCaratteristiche: String
  },
  dataVendita: { type: Date, default: Date.now },
  venditore: String
});

module.exports = mongoose.model('Maglietta', magliettaSchema);
