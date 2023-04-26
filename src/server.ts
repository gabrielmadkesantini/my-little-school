import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/prisma";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

import qrcode from "qrcode";

app.get("/student", async (req, res) => {
  const students = await prisma.student.findMany({
    include: {
      class: true,
    },
  });
  return res.json(students);
});

app.get("/student/:id", async (req, res) => {
  const { id } = req.params;
  const student = await prisma.student.findUnique({
    where: {
      id: Number(id),
    },
  });
  return res.json(student);
});
app.get("/student/name/:name", async (req, res) => {
  const { name } = req.params;
  const student = await prisma.student.findUnique({
    where: {
      name,
    },
    include: {
      class: {
        include: {
          course: {
            select: {
              name: true
            }
          }
        }
      },
    }
  });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  return res.status(200).json(student);
});

app.put("/student/:id", async (req, res) => {
  const { id } = req.params;
  const { name, birthDate, photo, classId } = req.body;
  await prisma.student.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      birthDate,
      photo,
      classId,
    },
  });
  return res.status(200).json({ message: "Student updated" });
});

app.delete("/student/:id", async (req, res) => {
  const { id } = req.params;
  const student = await prisma.student.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  await prisma.student.delete({
    where: {
      id: Number(id),
    },
  });
  return res.status(200).json({ message: "Student deleted" })
});

async function generateQRCode(name: string) {
  return await qrcode.toDataURL(`http://localhost:5173/student-card/${name}`);
}

app.post("/student", async (req, res) => {
  const { name, birthDate, photo, classId } = req.body;

  if (!name || !birthDate || !photo || !classId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const student = await prisma.student.findUnique({
    where: {
      name,
    },
  });

  if (student) {
    return res.status(409).json({ message: "Student already exists" });
  }

  const qrCode = await generateQRCode(name);

  await prisma.student.create({
    data: {
      name,
      birthDate,
      photo,
      qrCode,
      class: {
        connect: {
          id: Number(classId),
        },
      },
    },
  });

  return res.status(201).json();
});

// Class

app.get("/class", async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      students: true,
      course: true,
    },
  });
  return res.json(classes);
});

app.get("/class/:id", async (req, res) => {
  const { id } = req.params;
  const $class = await prisma.class.findUnique({
    where: {
      id: Number(id),
    },
  });
  return res.json($class);
});

app.put("/class/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const $class = await prisma.class.findUnique({
    where: { id: Number(id) },
  });
  if (!$class) {
    return res.status(404).json({ message: "Class not found" });
  }
  await prisma.class.update({
    where: { id: Number(id) },
    data: { name },
  });
  return res.status(200).json({ message: "Class updated" });
});

app.delete("/class/:id", async (req, res) => {
  const { id } = req.params;
  const class_ = await prisma.class.findUnique({
    where: { id: Number(id) },
  });
  if (!class_) {
    return res.status(404).json({ message: "Class not found" });
  }
  await prisma.class.delete({
    where: { id: Number(id) },
    include: {
      students: true,
      course: true,
    },
  });
  return res.status(200).json({ message: "Class deleted" });
});

app.post("/class", async (req, res) => {
  const { name, courseId } = req.body;
  if (!name || !courseId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  await prisma.class.create({
    data: {
      name,
      courseId,
    },
  });
  return res.status(201).json({ message: "Class created" });
});

// Course

app.get("/course", async (req, res) => {
  const courses = await prisma.course.findMany();
  console.log("CALLED");
  return res.json(courses);
});

app.get("/course/:id/class", async (req, res) => {
  const { id } = req.params;
  const classes = await prisma.class.findMany({
    where: {
      courseId: Number(id),
    },
  });
  return res.json(classes);
});

app.get("/course/name/:name/class", async (req, res) => {
  const { name } = req.params;
  const classes = await prisma.class.findMany({
    where: {
      course: {
        name,
      },
    },
  });
  return res.json(classes);
});

app.put("/course/:id", async (req, res) => {
  const { id } = req.params;
  const { name, educationLevel } = req.body;

  if (!name || !educationLevel) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const el = await prisma.educationLevel.findUnique({
    where: {
      name: educationLevel,
    },
  });

  if (!el) {
    return res.status(404).json({ message: "Education Level Not Found" });
  }

  const course = await prisma.course.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!course) {
    return res.status(404).json({ message: "Course Not Found" });
  }

  await prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      educationLevelId: el.id,
    },
  });

  return res.status(200).json({ message: "Course updated" });
});

app.delete("/course/:id", async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!course) {
    return res.status(404).json({ message: "Course Not Found" });
  }

  await prisma.course.delete({
    where: {
      id: Number(id),
    },
  });

  return res.status(200).json({ message: "Course deleted" });
});

app.post("/course", async (req, res) => {
  const { name, educationLevel } = req.body;

  if (!name || !educationLevel) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const el = await prisma.educationLevel.findUnique({
    where: {
      name: educationLevel,
    },
  });

  if (!el) {
    return res.status(404).json({ message: "Education Level Not Found" });
  }

  const course = await prisma.course.findUnique({
    where: {
      name,
    },
  });

  if (course) {
    return res.status(409).json({ message: "Course already exists" });
  }

  await prisma.course.create({
    data: {
      name,
      educationLevel: {
        connect: {
          name: educationLevel,
        },
      },
    },
  });
  return res.status(201).json({ message: "Course created" });
});

app.get("/health", async (req, res) => {
  return res.status(200).json({ message: "Ready!" });
});

// EducationLevel

app.get("/education-levels", async (req, res) => {
  const educationLevels = await prisma.educationLevel.findMany();
  console.log(educationLevels);
  return res.json(educationLevels);
});

app.get("/", async (req, res) => {
  const all = await prisma.course.findMany({
    include: {
      classes: {
        include: {
          students: true,
        },
      },
      educationLevel: {
        select: {
          name: true,
        },
      },
    },
  });
  return res.json(all);
});

app.listen(3000);
