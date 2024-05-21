import { expect } from 'chai';
import supertest from 'supertest';
import app from './app.mjs';

const request = supertest(app);

describe('Express App Tests', () => {
  // Test the home route
  it('GET / should return status 302', async () => {
    const response = await request.get('/');
    expect(response.status).to.equal(302);
  });

  // Test the login route
  it('GET /login should return status 200', async () => {
    const response = await request.get('/login');
    expect(response.status).to.equal(200);
  });

  // Test login with valid credentials
  it('POST /login with valid credentials should return status 302', async () => {
    const postData = {
      username: 'realYonathan',
      password: 'password',
    };

    const response = await request
      .post('/login')
      .send(postData)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(302);
  });

  // Test the registration route
  it('GET /register should return status 200', async () => {
    const response = await request.get('/register');
    expect(response.status).to.equal(200);
  });

  // Test registration with valid data
  it('POST /register with valid data should return status 302', async () => {
    const postData = {
      username: 'realBo',
      password: 'password',
      firstname: 'John',
      lastname: 'Doe',
    };

    const response = await request
      .post('/register')
      .send(postData)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(302);
  });

  // Test the logout route
  it('GET /logout should return status 302', async () => {
    const response = await request.get('/logout');
    expect(response.status).to.equal(302);
  });

  // Test adding a movie
  it('GET /addMovie should return status 302', async () => {
    const response = await request.get('/addMovie');
    expect(response.status).to.equal(302);
  });

  // Test updating a movie
  it('GET /updateMovie/:id should return status 302', async () => {
    const movieId = '656e21796808380eba643266'; 
    const response = await request.get(`/updateMovie/${movieId}`);
    expect(response.status).to.equal(302);
  });

  // Test deleting a movie
  it('DELETE /deleteMovie/:id should return status 302', async () => {
    const movieId = '656e21796808380eba643266'; 
    const response = await request.delete(`/deleteMovie/${movieId}`);
    expect(response.status).to.equal(302);
  });

  // Test adding a book
  it('GET /addBook should return status 302', async () => {
    const response = await request.get('/addBook');
    expect(response.status).to.equal(302);
  });

  // Test updating a book
  it('GET /updateBook/:id should return status 302', async () => {
    const bookId = '656e3c5279b19e5526f62ceb'; 
    const response = await request.get(`/updateBook/${bookId}`);
    expect(response.status).to.equal(302);
  });

  // Test deleting a book
  it('DELETE /deleteBook/:id should return status 302', async () => {
    const bookId = '656e3c5279b19e5526f62ceb'; 
    const response = await request.delete(`/deleteBook/${bookId}`);
    expect(response.status).to.equal(302);
  });

  // Test viewing a user's profile
  it('GET /profile/:id should return status 302', async () => {
    const userId = '656e4097c870e907bbfe4a9'; 
    const response = await request.get(`/profile/${userId}`);
    expect(response.status).to.equal(302);
  });

  // Test updating a user's profile
  it('GET /profile/:id/update should return status 302', async () => {
    const userId = '656e4097c870e907bbfe4a9'; 
    const response = await request.get(`/profile/${userId}/update`);
    expect(response.status).to.equal(302);
  });

  // Test updating a user's profile (POST)
  it('POST /profile/:id/update should return status 302', async () => {
    const userId = '656e4097c870e907bbfe4a9'; 
    const postData = {
      username: 'realCo',
      password: 'password',
      firstname: 'John',
      lastname: 'Doe',
      about: 'love',
    };
    const response = await request.post(`/profile/${userId}/update`).send(postData).set('Accept', 'application/json');
    expect(response.status).to.equal(302);
  });
});

