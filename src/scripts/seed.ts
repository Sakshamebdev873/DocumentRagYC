import "dotenv/config";
import bcrypt from "bcryptjs";
import { embeddingModel } from "../config/gemini";
import { prisma } from "../config/prisma";
import { Role } from "../../generated/prisma";

const DEFAULT_PASSWORD = "securepassword123";

type SeedDoc = {
  filename: string;
  text: string;
  allowedRole: Role;
  department: string | null;
  uploadedByEmail: string;
  visibleToEmails: string[];
};

function chunkText(text: string, maxWords = 180) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let index = 0; index < words.length; index += maxWords) {
    chunks.push(words.slice(index, index + maxWords).join(" "));
  }

  return chunks;
}

async function createUser(email: string, role: Role, department: string | null) {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  return prisma.user.create({
    data: {
      email,
      password,
      role,
      department,
      isActive: true,
    },
  });
}

async function createDocumentWithChunks(document: SeedDoc) {
  const uploader = await prisma.user.findUnique({ where: { email: document.uploadedByEmail } });
  if (!uploader) {
    throw new Error(`Uploader not found for ${document.filename}`);
  }

  const viewers = await prisma.user.findMany({
    where: { email: { in: document.visibleToEmails } },
    select: { id: true },
  });
  const visibleToUserIds = viewers.map((viewer) => viewer.id);

  const createdDocument = await prisma.document.create({
    data: {
      filename: document.filename,
      fileType: "text/plain",
      uploadedBy: uploader.id,
      ingestionStatus: "PROCESSING",
      allowedRole: document.allowedRole,
      department: document.department,
      isActive: true,
      visibleToUserIds,
    },
  });

  const chunks = chunkText(document.text);
  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const embedding = await embeddingModel.embedContent(chunk);

    await prisma.documentChunk.create({
      data: {
        chunkIndex: index,
        text: chunk,
        embedding: embedding.embedding.values,
        documentId: createdDocument.id,
        allowedRole: document.allowedRole,
        department: document.department,
        visibleToUserIds,
        isActive: true,
      },
    });
  }

  await prisma.document.update({
    where: { id: createdDocument.id },
    data: {
      ingestionStatus: "COMPLETED",
      errorMessage: null,
    },
  });
}

async function resetDatabase() {
  await prisma.approvedAnswer.deleteMany();
  await prisma.workflowDraft.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Resetting database...");
  await resetDatabase();

  console.log("Creating test users...");
  await createUser("admin@documentrag.dev", "ADMIN", "SYSTEM");
  await createUser("engineer@documentrag.dev", "EMPLOYEE", "ENGINEERING");
  await createUser("platform@documentrag.dev", "EMPLOYEE", "ENGINEERING");
  await createUser("legal@documentrag.dev", "EMPLOYEE", "LEGAL");
  await createUser("counsel@documentrag.dev", "EMPLOYEE", "LEGAL");

  const documents: SeedDoc[] = [
    {
      filename: "engineering-onboarding.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: "ENGINEERING",
      visibleToEmails: ["engineer@documentrag.dev"],
      text: `Engineering onboarding guide.
New engineers should request access to GitHub, the staging cluster, the incident dashboard, and the internal API catalog on day one.
The standard first week includes local environment setup, shadowing a deployment, and reviewing the architecture decision record index.
For service deployment, engineers create a release branch, run the CI pipeline, and request production approval from the on-call owner if the service touches payments or authentication.
For API changes, teams must document request and response contracts in the internal API docs before merge.
Remote work policy for engineering allows fully remote work inside approved countries with core collaboration hours from 10 AM to 3 PM Eastern Time.`
    },
    {
      filename: "incident-escalation-runbook.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: "ENGINEERING",
      visibleToEmails: ["platform@documentrag.dev"],
      text: `Incident escalation runbook.
Severity 1 incidents page the primary on-call engineer immediately and require opening the incident channel within five minutes.
The incident commander is the on-call engineer until a staff engineer or engineering manager takes over.
If customer impact lasts longer than fifteen minutes, notify support leadership and post a status-page update.
Database or authentication outages require escalation to the platform lead and security contact.
After mitigation, teams must schedule a post-incident review within two business days.`
    },
    {
      filename: "security-secrets-policy.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: "ENGINEERING",
      visibleToEmails: ["engineer@documentrag.dev", "platform@documentrag.dev"],
      text: `Security and secrets rotation policy.
Production secrets are stored only in the managed secrets vault.
Service teams rotate secrets every ninety days, or immediately after suspected exposure.
Changes to authentication keys require approval from the security owner and the platform on-call engineer.
Never store secrets in code, screenshots, tickets, or shared chat messages.
If a secret is exposed, revoke it immediately, rotate dependent credentials, and open a security incident ticket.`
    },
    {
      filename: "legal-contract-review-playbook.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: "LEGAL",
      visibleToEmails: ["legal@documentrag.dev"],
      text: `Legal contract review playbook.
All customer contracts with non-standard indemnity, liability caps, or data residency terms must be reviewed by legal before signature.
Sales should submit the contract request form with the redlined agreement, counterparty name, and target close date.
Standard turnaround is two business days for routine review and same-day triage for deals marked urgent by the general counsel.
Any clause involving audit rights, data processing obligations, or export restrictions must be escalated to privacy counsel.`
    },
    {
      filename: "privacy-escalation-policy.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: "LEGAL",
      visibleToEmails: ["counsel@documentrag.dev"],
      text: `Privacy and data request policy.
Data subject access requests must be acknowledged within three business days and completed within thirty days unless local law sets a shorter deadline.
Requests involving deletion of customer billing records require finance confirmation before action.
Security incidents that may involve regulated personal data must be escalated to privacy counsel and the security lead immediately.
Only legal and approved privacy operations staff may approve final external responses to privacy requests.`
    },
    {
      filename: "company-remote-work-policy.txt",
      uploadedByEmail: "admin@documentrag.dev",
      allowedRole: "EMPLOYEE",
      department: null,
      visibleToEmails: ["engineer@documentrag.dev", "platform@documentrag.dev", "legal@documentrag.dev", "counsel@documentrag.dev"],
      text: `Company remote work policy.
Employees may work remotely from approved locations listed by People Operations.
All teams must maintain shared core hours from 10 AM to 3 PM Eastern Time.
Managers should document any role-specific onsite expectations in the department handbook.
International remote work longer than thirty days requires HR and legal review before approval.`
    },
  ];

  console.log("Creating searchable test documents...");
  for (const document of documents) {
    console.log(`- ${document.filename}`);
    await createDocumentWithChunks(document);
  }

  console.log("Seed complete.");
  console.log("Test accounts:");
  console.log(`- admin@documentrag.dev / ${DEFAULT_PASSWORD}`);
  console.log(`- engineer@documentrag.dev / ${DEFAULT_PASSWORD}`);
  console.log(`- platform@documentrag.dev / ${DEFAULT_PASSWORD}`);
  console.log(`- legal@documentrag.dev / ${DEFAULT_PASSWORD}`);
  console.log(`- counsel@documentrag.dev / ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
