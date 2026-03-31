const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const users = [
  {
    id: 1,
    name: 'Madhurima Kuchulakanti',
    email: 'madhurima@banksmart.com',
    password: 'Smart@123',
    phone: '+1 (555) 234-5678',
    accountNumber: 'BS-4821-9034-7651',
    balance: 24850.75,
    savingsBalance: 12400.00,
    creditScore: 785
  }
];

const transactions = [
  { id: 1, userId: 1, type: 'credit', amount: 5000.00, description: 'Salary - Tech Corp', date: '2026-03-28', category: 'Income', status: 'completed' },
  { id: 2, userId: 1, type: 'debit', amount: 120.50, description: 'Netflix Subscription', date: '2026-03-27', category: 'Entertainment', status: 'completed' },
  { id: 3, userId: 1, type: 'debit', amount: 850.00, description: 'Rent Payment', date: '2026-03-25', category: 'Housing', status: 'completed' },
  { id: 4, userId: 1, type: 'credit', amount: 250.00, description: 'Freelance Payment', date: '2026-03-24', category: 'Income', status: 'completed' },
  { id: 5, userId: 1, type: 'debit', amount: 45.99, description: 'Amazon Purchase', date: '2026-03-23', category: 'Shopping', status: 'completed' },
  { id: 6, userId: 1, type: 'debit', amount: 200.00, description: 'Transfer to Savings', date: '2026-03-22', category: 'Transfer', status: 'completed' },
  { id: 7, userId: 1, type: 'debit', amount: 89.00, description: 'Electric Bill', date: '2026-03-21', category: 'Utilities', status: 'completed' },
  { id: 8, userId: 1, type: 'credit', amount: 1200.00, description: 'Investment Returns', date: '2026-03-20', category: 'Investment', status: 'completed' }
];

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber }
  });
});

app.get('/api/dashboard/:userId', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const userTransactions = transactions.filter(t => t.userId === user.id);
  res.json({
    success: true,
    balance: user.balance,
    savingsBalance: user.savingsBalance,
    creditScore: user.creditScore,
    accountNumber: user.accountNumber,
    recentTransactions: userTransactions.slice(0, 5)
  });
});

app.get('/api/transactions/:userId', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, transactions: transactions.filter(t => t.userId === user.id) });
});

app.post('/api/transfer', (req, res) => {
  const { fromUserId, toAccount, amount, description } = req.body;
  if (!fromUserId || !toAccount || !amount) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
  }
  if (amount > 10000) {
    return res.status(400).json({ success: false, message: 'Transfer limit exceeded. Maximum is $10,000 per transaction' });
  }
  const user = users.find(u => u.id === parseInt(fromUserId));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.balance < amount) {
    return res.status(400).json({ success: false, message: 'Insufficient funds' });
  }
  user.balance -= parseFloat(amount);
  const newTransaction = {
    id: transactions.length + 1,
    userId: user.id,
    type: 'debit',
    amount: parseFloat(amount),
    description: description || `Transfer to ${toAccount}`,
    date: new Date().toISOString().split('T')[0],
    category: 'Transfer',
    status: 'completed'
  };
  transactions.push(newTransaction);
  res.json({ success: true, message: 'Transfer successful', newBalance: user.balance, transaction: newTransaction });
});

app.get('/api/account/:userId', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, accountNumber: user.accountNumber, creditScore: user.creditScore }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'BankSmart API is running', version: '1.0.0' });
});

app.listen(4000, () => {
  console.log('BankSmart running at http://localhost:4000');
});