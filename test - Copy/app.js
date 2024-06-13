

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

// Define schema for transactions
const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date
});

// Create model based on schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Initializing the database with data from the third-party API
const initializeDatabase = async () => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    // Insert data into MongoDB
    await Transaction.insertMany(data);

    console.log('Data inserted into MongoDB');
  } catch (error) {
    console.error('Error fetching data from third-party API:', error);
  }
};

app.get('/',(req,res)=>{
  res.render('index');
})

// API to list to get all transactions
app.get('/transactions', async (req, res) => {
  const { month, page = 1, perPage = 10, search } = req.query;

  try {
    let query = {};

    // Filter by month
    if (month) {
      query.dateOfSale = { $month: parseInt(month) };
    }

    // Filter by search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginate results
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    const transactions = await Transaction.find(query)
      .skip(startIndex)
      .limit(perPage);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage)
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/statistics', (req, res) => {
  const month = req.query.month;

  if (!month) {
    return res.status(400).json({ error: 'Please specify a month' });
  }

  // Implement logic to fetch statistics from your database or data source
  // Replace this with your actual data retrieval
  
  
  const totalSaleAmount = 1000;
  const totalSoldItems = 500;
  const totalNotSoldItems = 200;

  res.json({
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems

  // const db = require('./database'); // Replace this with your actual database connection

  // db.query(`SELECT SUM(sale_amount) AS totalSaleAmount, COUNT(*) AS totalSoldItems, COUNT(*) FILTER (WHERE sold = false) AS totalNotSoldItems FROM sales WHERE EXTRACT(MONTH FROM sale_date) = ${month}`, (error, results) => {
  //   if (error) {
  //     return res.status(500).json({ error: 'Error fetching statistics from the database' });
  //   }

  //   const { rows } = results;
  //   const [statistics] = rows;

  //   res.json(statistics);


  });
});




app.get('/api/statistics', (req, res) => {
  const month = req.query.month;

  if (!month) {
    return res.status(400).json({ error: 'Please specify a month' });
  }

  const barChartData = getBarChartData(month);
  const pieChartData = getPieChartData(month);

  const combinedData = {
    bar_chart: barChartData,
    pie_chart: pieChartData,
  };

  res.json(combinedData);
});

function getBarChartData(month) {
  // Replace this with your actual database query
  // This is just a sample implementation
  const barChartData = {
    "0-100": 10,
    "101-200": 20,
    "201-300": 30,
    "301-400": 40,
    "401-500": 50,
    "501-600": 60,
    "601-700": 70,
    "701-800": 80,
    "801-900": 90,
    "901-above": 100,
  };
  return barChartData;
}

function getPieChartData(month) {
  // Replace this with your actual database query
  // This is just a sample implementation
  const pieChartData = {
    "X category": 20,
    "Y category": 5,
    "Z category": 3,
  };
  return pieChartData;
}


// Initialize the database on startup
initializeDatabase();

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
