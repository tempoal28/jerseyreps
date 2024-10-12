const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI;

console.log("MONGODB_URI:", mongoURI);

const venditaRoutes = require('./routes/venditaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connessione a MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("Connesso a MongoDB")) // Messaggio di conferma
  .catch((error) => console.error("Errore nella connessione a MongoDB:", error));

const venditaSchema = new mongoose.Schema({
    lega: String,
    squadra: String,
    giocatore: String,
    taglia: String,
    patch: [String], // Array di patch
    informazioni: String,
    acquirente: String,
    prezzo: Number,
    data: { type: Date, default: Date.now } // Data di vendita
});

// Definizione delle leghe
const leghe = {
    "Premier League": [
        "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea", 
        "Crystal Palace", "Everton", "Fulham", "Ipswich", "Leicester", "Liverpool", 
        "Manchester City", "Manchester United", "Newcastle", "Nottingham Forest", 
        "Southampton", "Tottenham", "West Ham", "Wolverhampton"
    ],
    "Serie A": [
        "Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", 
        "Hellas Verona", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", 
        "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia"
    ],
    "Bundesliga": [
        "Bayern Monaco", "Borussia Dortmund", "Borussia Monchengladbach", "Eintracht Francoforte", 
        "FSV Frankfurt", "Hannover 96", "Hertha Berlin", "Hoffenheim", "Karlsruher", 
        "Magdeburg FC", "Red Bull Leipzig", "Regensburg", "Stoccarda", "SV Sandhausen", 
        "Union Berlin", "Werder Brema", "Wolfsburg"
    ],
    "La Liga": [
        "Algeciras", "Atletico Madrid", "Barcellona", "Betis Siviglia", "Eibar", 
        "Espanyol", "Girona FC", "LALIGA", "Leganes", "Malaga CF", "Numancia", 
        "Osasuna", "Real Madrid", "Real Sociedad", "Tenerife CD", "Valencia", 
        "Villareal"
    ],
    "Nazionali": [
        "Italia", "Francia", "Germania", "Spagna", "Argentina", "Brasile", "Portogallo", 
        "Inghilterra", "Belgio", "Olanda", "Croazia"
    ],
    "Edizioni Speciali": [
        "Special Edition Team 1", "Special Edition Team 2", "Special Edition Team 3", 
        "Special Edition Team 4", "Special Edition Team 5"
    ]
};

// Modello per le vendite
const Vendita = mongoose.model('Vendita', venditaSchema);

// Rotta per aggiungere una nuova vendita
app.post('/vendite/aggiungi', (req, res) => {
    const { lega, squadra, giocatore, taglia, patch, informazioni, acquirente, prezzo, dataVendita, oraVendita } = req.body;

    // Imposta la data e l'ora
    let data = new Date();

    // Se viene fornita una data, impostala
    if (dataVendita) {
        data = new Date(dataVendita);
    }

    // Se viene fornita un'ora, impostala
    if (oraVendita) {
        const [ore, minuti] = oraVendita.split(':');
        data.setHours(ore, minuti);
    }

    const nuovaVendita = new Vendita({
        lega,
        squadra,
        giocatore,
        taglia,
        patch, // Salva le patch come array
        informazioni,
        acquirente,
        prezzo,
        data, // Usa la data impostata
    });

    nuovaVendita.save()
        .then(() => {
            res.redirect('/analitica'); // Reindirizza alla pagina analitica dopo il salvataggio
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Errore durante il salvataggio della vendita.');
        });
});

// Rotta per visualizzare l'analisi delle vendite
app.get('/analitica', (req, res) => {
    const { lega, squadra, taglia } = req.query;

    let query = {};
    if (lega) query.lega = lega;
    if (squadra) query.squadra = squadra;
    if (taglia) query.taglia = taglia;

    Vendita.find(query)
        .then(vendite => {
            const totaleEntrate = vendite.reduce((acc, vendita) => acc + vendita.prezzo, 0);
            res.render('index', { vendite, totaleEntrate }); // Passa le vendite e il totale alla vista
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Errore durante il recupero delle vendite.');
        });
});



// Rotta per cancellare una vendita
app.post('/vendite/cancella/:id', (req, res) => {
    const id = req.params.id;
    Vendita.findByIdAndDelete(id)
        .then(() => {
            res.redirect('/analitica'); // Reindirizza alla pagina analitica dopo la cancellazione
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Errore durante la cancellazione della vendita.');
        });
});

// Rotta per visualizzare il modulo di modifica per una vendita specifica
app.get('/vendite/modifica/:id', (req, res) => {
    const id = req.params.id;

    Vendita.findById(id)
        .then(vendita => {
            if (!vendita) {
                return res.status(404).send('Vendita non trovata.');
            }
            res.render('modifica', { vendita }); // Passa i dati della vendita alla vista
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Errore durante il recupero della vendita.');
        });
});

// Rotta per modificare una vendita
app.post('/vendite/modifica/:id', (req, res) => {
    const id = req.params.id;
    const { lega, squadra, giocatore, taglia, patch, informazioni, acquirente, prezzo } = req.body;

    Vendita.findByIdAndUpdate(id, {
        lega,
        squadra,
        giocatore,
        taglia,
        patch,
        informazioni,
        acquirente,
        prezzo,
    }, { new: true })
    .then(() => {
        res.redirect('/analitica'); // Reindirizza alla pagina analitica dopo la modifica
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Errore durante la modifica della vendita.');
    });
});

// Rotte
app.use('/vendite', venditaRoutes);

// Rotta per la homepage
app.get('/', (req, res) => {
    res.render('homepage'); // Renderizza la homepage
});

// Avvio del Server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});

app.set('view engine', 'ejs');
app.set('views', './views');
