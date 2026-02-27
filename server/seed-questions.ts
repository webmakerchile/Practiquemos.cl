import { storage } from "./storage";
import { questionsBank } from "../lib/questionsData";
import { questionsPart2 } from "../lib/questions-part2";
import { questionsPart3 } from "../lib/questions-part3";
import { questionsPart4 } from "../lib/questions-part4";
import { questionsPart5 } from "../lib/questions-part5";
import { questionsPart6 } from "../lib/questions-part6";
import { questionsPart7 } from "../lib/questions-part7";
import { questionsA2 } from "../lib/questions-a2";
import { questionsA4 } from "../lib/questions-a4";
import { questionsClaseC } from "../lib/questions-c";
import { questionsClaseD } from "../lib/questions-d";
import { questionsClaseE } from "../lib/questions-e";
import { questionsOficialPart1 } from "../lib/questions-oficial-conaset";
import { questionsOficialPart2 } from "../lib/questions-oficial-conaset2";
import { questionsOficialClaseC } from "../lib/questions-oficial-clase-c";

const allQuestions = [
  ...questionsBank,
  ...questionsPart2,
  ...questionsPart3,
  ...questionsPart4,
  ...questionsPart5,
  ...questionsPart6,
  ...questionsPart7,
  ...questionsA2,
  ...questionsA4,
  ...questionsClaseC,
  ...questionsClaseD,
  ...questionsClaseE,
  ...questionsOficialPart1,
  ...questionsOficialPart2,
  ...questionsOficialClaseC,
];

export async function seedQuestions(): Promise<void> {
  const existingCount = await storage.getQuestionsCount();
  if (existingCount > 0) {
    console.log(`Questions table already has ${existingCount} questions, skipping seed.`);
    return;
  }

  console.log(`Seeding ${allQuestions.length} questions into database...`);

  const idSet = new Set<number>();
  const deduplicated = [];
  for (const q of allQuestions) {
    if (idSet.has(q.id)) {
      console.warn(`Duplicate question ID ${q.id} found, skipping.`);
      continue;
    }
    idSet.add(q.id);
    deduplicated.push(q);
  }

  const dbRows = deduplicated.map(q => ({
    id: q.id,
    pregunta: q.pregunta,
    opciones: q.opciones,
    respuestaCorrecta: q.respuestaCorrecta,
    explicacionTexto: q.explicacionTexto || "",
    categoria: q.categoria,
    dificultad: q.dificultad || "media",
    licenseTypes: q.licenseTypes,
    oficial: q.oficial || false,
    urlAudio: q.urlAudio || "",
    enabled: true,
  }));

  await storage.bulkInsertQuestions(dbRows);
  console.log(`Successfully seeded ${dbRows.length} questions.`);
}
