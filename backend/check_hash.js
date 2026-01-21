
import bcrypt from 'bcryptjs';

const hash = '$2b$10$PNNmR2uLXp.kmbKv3SRS5uAH4nGBduJDUrkjpt21w01I1.IS5MuC6';
const password = 'admin123';

bcrypt.compare(password, hash).then(res => {
    console.log(`Does 'admin123' match the hash? ${res}`);
});
