import 'dotenv/config';
import app from './app';


const PORT = Number(process.env['PORT'] ?? 3000);

app.listen(PORT, () => {
    console.log(`\n🍔  D'LICIOUS API  →  http://localhost:${PORT}`);
    console.log(`   Health  →  http://localhost:${PORT}/api/health`);
    console.log(`   Menu    →  http://localhost:${PORT}/api/menu\n`);
    });
 