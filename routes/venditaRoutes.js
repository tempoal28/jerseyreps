const express = require('express');
const router = express.Router();
const Maglietta = require('../models/maglietta');

// Rotta per inserire una nuova vendita
router.post('/aggiungi', async (req, res) => {
    try {
      const venditaData = {
        ...req.body,
        dataVendita: req.body.dataVendita || new Date()
      };
      const nuovaVendita = new Maglietta(venditaData);
      await nuovaVendita.save();
      res.status(201).send('Vendita aggiunta con successo!');
    } catch (error) {
      res.status(500).send('Errore durante l\'aggiunta della vendita: ' + error.message);
    }
    console.log(req.body)
  });
  

// Rotta per visualizzare tutte le vendite in ordine cronologico
router.get('/analitica/view', async (req, res) => {
    try {
      const vendite = await Maglietta.find().sort({ dataVendita: -1 });
      res.render('index', { vendite });
    } catch (error) {
      res.status(500).send('Errore durante il recupero delle vendite: ' + error.message);
    }
  });
  
// Rotta per visualizzare il form di inserimento
router.get('/aggiungi/form', (req, res) => {
    res.render('add');
  });
  
module.exports = router;
