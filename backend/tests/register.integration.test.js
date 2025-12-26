import request from 'supertest';
import app from '../server.js';

describe('POST /api/v1/register', () => {
  it('should register a user with valid data', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        first_name: 'matin',
        email: 'matin@gmail.com',
        password: '12345678',
        age: 18,
        preferences: 'reading music sports',
        notifications: true,
        energy: 100,
        coins: 20,
        languages: [
          {
            native_language_id: 1,
            learning_language_id: 2,
            proficiency_level: 'N',
            experience: 0,
            learned_vocabulary: [
              { id: 1, mastery_level: 0, last_review: '2025-12-18T15:30:45.123Z', created_at: '2025-12-18T15:30:45.123Z' }
            ]
          }
        ]
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('first_name', 'matin');
    expect(res.body.data.user).toHaveProperty('email', 'matin@gmail.com');
    expect(res.body.data.user).toHaveProperty('age', 18);
    expect(res.body.data.user).toHaveProperty('energy', 100);
    expect(res.body.data.user).toHaveProperty('coins', 20);
    expect(res.body.data.user).toHaveProperty('preferences', 'reading music sports');
    expect(res.body.data.user).toHaveProperty('languages');
  });
});


// in the postman:
// {
//     "first_name": "matin",
//     "email": "amir9@ionio.gr",
//     "password": "12345678",
//     "age": 18,
//     "notifications": true,
//     "energy": 100,
//     "coins": 20,
//     "preferences": "reading music sports",
//     "languages":[
//         {"native_language_id": 1,
//          "learning_language_id": 2,
//          "is_current_language": true,
//          "proficiency_level": "N",
//          "created_at": "2025-12-18T15:30:45.123Z",
//          "experience": 24,
//          "learned_vocabulary": [
//              {"id": 1, "mastery_level": 1, "last_review": "2025-12-18T15:30:45.123Z", "created_at": "2025-12-18T15:30:45.123Z"}
//         ]},
//         {
//         "native_language_id": 1,
//          "learning_language_id": 1,
//          "is_current_language": false,
//          "proficiency_level": "C1",
//          "created_at": "2025-12-18T15:30:45.123Z",
//          "experience": 10101,
//          "learned_vocabulary": []
//          }

//     ]
// }