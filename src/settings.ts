import { Sequelize } from "sequelize";
import process from "node:process";
import nodemailer from "nodemailer";

export const sequelize = new Sequelize(
  "testdb",
  "postgres",
  process.env["DATABASE_PASSWORD"],
  {
    dialect: "postgres",
    host: "localhost",
    port: 5432,
    logging: false,
  }
);

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "gregory.kessler96@ethereal.email",
    pass: "f4TCpydPSY8VuGVY9S",
  },
});
