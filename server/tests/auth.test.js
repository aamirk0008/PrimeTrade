const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

// ─── Test DB Setup ─────────────────────────────────────────────────────────────
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-12345';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-12345';

  await mongoose.connect(
    process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/scalable_app_test'
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe('Auth Endpoints', () => {
  let accessToken;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.statusCode).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        ...testUser,
        email: 'not-an-email',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        ...testUser,
        email: 'other@example.com',
        password: 'weak',
        passwordConfirm: 'weak',
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      accessToken = res.body.accessToken;
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass123' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Protected Route', () => {
    it('should get profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });
  });
});

// ─── Task CRUD Tests ──────────────────────────────────────────────────────────
describe('Task CRUD Endpoints', () => {
  let accessToken;
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123' });
    accessToken = res.body.accessToken;
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Task', description: 'A test task', priority: 'high' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.task.title).toBe('Test Task');
    taskId = res.body.data.task._id;
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in-progress' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.status).toBe('in-progress');
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('should return 404 for deleted task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
});
