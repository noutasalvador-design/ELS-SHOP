import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ELS_ADMIN_EMAIL?.trim().toLowerCase();
  const confirmation = process.env.ELS_ADMIN_CONFIRM;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est absent. Configurez la connexion PostgreSQL dans votre environnement local.");
  }
  if (!email || !email.includes("@")) {
    throw new Error("Définissez ELS_ADMIN_EMAIL avec l’adresse exacte d’un compte déjà inscrit.");
  }
  if (confirmation !== "MAKE_ADMIN") {
    throw new Error('Pour confirmer cette opération, définissez ELS_ADMIN_CONFIRM="MAKE_ADMIN".');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, store: { select: { id: true, name: true } } }
  });

  if (!user) {
    throw new Error("Aucun compte ne correspond à cette adresse. Créez d’abord le compte via le site, puis relancez le script.");
  }
  if (user.role === "ADMIN") {
    console.log("Ce compte possède déjà le rôle ADMIN. Aucune modification nécessaire.");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" }
  });

  if (user.store) {
    console.log(`Rôle ADMIN attribué à ${user.email}. Sa boutique « ${user.store.name} » est conservée et les fonctions vendeur sont autorisées pour les comptes ADMIN.`);
  } else {
    console.log(`Rôle ADMIN attribué au compte ${user.email}. Connectez-vous à ELS SHOP puis ouvrez /administration.`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Échec de l’opération.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
