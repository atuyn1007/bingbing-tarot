const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dataFile = path.join(__dirname, 'data.json');

const majorArcanaNames = [
  '愚者',
  '魔术师',
  '女祭司',
  '女皇',
  '皇帝',
  '教皇',
  '恋人',
  '战车',
  '力量',
  '隐者',
  '命运之轮',
  '正义',
  '倒吊人',
  '死神',
  '节制',
  '恶魔',
  '高塔',
  '星星',
  '月亮',
  '太阳',
  '审判',
  '世界',
];

const suits = ['权杖', '圣杯', '宝剑', '星币'];
const ranks = ['王牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'];

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
  } catch (error) {
    console.log('读取数据文件失败，将使用新的空数据。');
  }

  return {
    users: [],
    requests: [],
    nextUserId: 1,
    nextRequestId: 1,
  };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

let data = loadData();

const tarotCards = [
  ...majorArcanaNames.map((name, id) => ({ id, name })),
  ...suits.flatMap((suit, suitIndex) =>
    ranks.map((rank, rankIndex) => ({
      id: 22 + suitIndex * ranks.length + rankIndex,
      name: `${suit}${rank}`,
    })),
  ),
];

function drawRandomCard() {
  const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
  return {
    ...card,
    isReversed: Math.random() < 0.5,
  };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

app.post('/api/auth/register', (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: '昵称和密码不能为空。' });
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return res.status(400).json({ error: '昵称长度需要在 2 到 20 个字符之间。' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: '密码至少需要 4 位。' });
  }

  const existingUser = data.users.find((user) => user.nickname === nickname);
  if (existingUser) {
    return res.status(400).json({ error: '该昵称已经被注册。' });
  }

  const newUser = {
    id: data.nextUserId++,
    nickname,
    password,
    coinBalance: 0,
    lastSignInDate: null,
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  saveData(data);

  return res.json({ success: true, nickname: newUser.nickname });
});

app.post('/api/auth/login', (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: '昵称和密码不能为空。' });
  }

  const user = data.users.find((item) => item.nickname === nickname && item.password === password);
  if (!user) {
    return res.status(401).json({ error: '昵称或密码错误。' });
  }

  return res.json({
    success: true,
    nickname: user.nickname,
    coinBalance: user.coinBalance,
    lastSignInDate: user.lastSignInDate,
  });
});

app.get('/api/user/:nickname', (req, res) => {
  const nickname = req.params.nickname;
  const user = data.users.find((item) => item.nickname === nickname);

  if (!user) {
    return res.status(404).json({ error: '用户不存在。' });
  }

  return res.json({
    nickname: user.nickname,
    coinBalance: user.coinBalance,
    lastSignInDate: user.lastSignInDate,
  });
});

app.patch('/api/user/:nickname/coins', (req, res) => {
  const nickname = req.params.nickname;
  const { coinBalance } = req.body;

  const user = data.users.find((item) => item.nickname === nickname);
  if (!user) {
    return res.status(404).json({ error: '用户不存在。' });
  }

  user.coinBalance = coinBalance;
  saveData(data);

  return res.json({ success: true });
});

app.patch('/api/user/:nickname/signin', (req, res) => {
  const nickname = req.params.nickname;
  const today = new Date().toDateString();
  const todayKey = getLocalDateKey();
  const user = data.users.find((item) => item.nickname === nickname);

  if (!user) {
    return res.status(404).json({ error: '用户不存在。' });
  }

  if (user.lastSignInDate === today) {
    user.dailyHistory = user.dailyHistory || {};
    if (user.todayCard && !user.dailyHistory[todayKey]) {
      user.dailyHistory[todayKey] = user.todayCard;
      saveData(data);
    }

    return res.json({
      success: true,
      alreadySignedIn: true,
      lastSignInDate: today,
      todayCard: user.todayCard || null,
      dailyHistory: user.dailyHistory || {},
      coinBalance: user.coinBalance,
    });
  }

  const todayCard = drawRandomCard();

  user.lastSignInDate = today;
  user.todayCard = {
    name: todayCard.name,
    isReversed: todayCard.isReversed,
  };
  user.dailyHistory = user.dailyHistory || {};
  user.dailyHistory[todayKey] = user.todayCard;
  user.coinBalance = (user.coinBalance || 0) + 1;
  saveData(data);

  return res.json({
    success: true,
    alreadySignedIn: false,
    lastSignInDate: today,
    todayCard: user.todayCard,
    dailyHistory: user.dailyHistory,
    coinBalance: user.coinBalance,
  });
});

app.get('/api/user/:nickname/daily', (req, res) => {
  const nickname = req.params.nickname;
  const today = new Date().toDateString();
  const todayKey = getLocalDateKey();
  const user = data.users.find((item) => item.nickname === nickname);

  if (!user) {
    return res.status(404).json({ error: '用户不存在。' });
  }

  user.dailyHistory = user.dailyHistory || {};
  if (user.lastSignInDate === today && user.todayCard && !user.dailyHistory[todayKey]) {
    user.dailyHistory[todayKey] = user.todayCard;
    saveData(data);
  }

  return res.json({
    lastSignInDate: user.lastSignInDate,
    today,
    isSignedInToday: user.lastSignInDate === today,
    todayCard: user.lastSignInDate === today ? user.todayCard : null,
    dailyHistory: user.dailyHistory || {},
    coinBalance: user.coinBalance,
  });
});

app.post('/api/request', (req, res) => {
  const { userId, userNickname, question, cards, teacherNickname, spreadKey, spreadName } = req.body;

  const newRequest = {
    id: data.nextRequestId++,
    userId,
    userNickname,
    teacherNickname: teacherNickname || '饼饼大人',
    spreadKey: spreadKey || 'three',
    spreadName: spreadName || '三张牌阵',
    question,
    cards,
    timestamp: new Date().toISOString(),
    status: 'pending',
    messages: [],
  };

  data.requests.push(newRequest);
  saveData(data);

  return res.json({ success: true, id: newRequest.id });
});

app.get('/api/requests', (req, res) => {
  return res.json(data.requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.get('/api/requests/user/:nickname', (req, res) => {
  const nickname = req.params.nickname;
  const userRequests = data.requests
    .filter((request) => request.userNickname === nickname)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return res.json(userRequests);
});

app.get('/api/request/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const request = data.requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: '请求不存在。' });
  }

  return res.json(request);
});

app.post('/api/request/:id/message', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { sender, text } = req.body;
  const request = data.requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: '请求不存在。' });
  }

  request.messages.push({
    id: Date.now(),
    sender,
    text,
    timestamp: new Date().toISOString(),
  });

  saveData(data);
  return res.json({ success: true });
});

app.patch('/api/request/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const request = data.requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: '请求不存在。' });
  }

  request.status = status;
  saveData(data);
  return res.json({ success: true });
});

app.post('/api/teacher/login', (req, res) => {
  const { password } = req.body;
  if (password === 'bingbing') {
    return res.json({ success: true, token: 'teacher-token' });
  }

  return res.status(401).json({ error: '老师密码错误。' });
});

app.listen(PORT, () => {
  console.log(`饼饼塔罗后端服务已启动，端口：${PORT}`);
  console.log(`数据文件位置：${dataFile}`);
});
