const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("Error: Las variables ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidas en tu archivo .env");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador Principal',
      role: 'ADMIN',
    },
  });
  
  console.log('✅ Usuario admin creado (o verificado) con éxito usando las credenciales del .env');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
