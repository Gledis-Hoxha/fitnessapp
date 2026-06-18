# StrengthStack

StrengthStack is a fitness and nutrition app I built to keep my training, meals, and recovery in one place — without juggling three different apps that never talk to each other.

It started as a tool for tracking my own workouts and slowly grew into a full companion: an exercise library with demos, routine planning, nutrition logging, sleep and step tracking, and an AI coach that actually knows my history.

## What it does

- **Workouts** — Start a live session, log sets, reps, and weight, and track your progress over time. Build reusable routines and plan your training week.
- **Exercise library** — Browse and search a large database of exercises with animated demonstrations, target muscles, equipment, and step-by-step instructions.
- **Nutrition** — Log meals, track calories and macros, save meal plans, and stay on top of hydration with a daily overview.
- **Activity tracking** — Steps, sleep, heart rate, and general fitness activities, all visualized so the trends are easy to read.
- **AI coach** — A personal coach that reads your actual workout, nutrition, and activity logs to give direct, tailored advice instead of generic tips.
- **Profile & progress** — Your stats, calendars, charts, and a shareable profile.

## Design

The whole app runs on a clean dark theme with a blue and green accent palette, designed to feel calm and focused — the kind of interface you don't mind opening at 6am or right before bed. It's fully responsive, so it works just as well on a phone at the gym as it does on a laptop.

## Tech

Built with React and Tailwind CSS, with a component library for consistent UI. Exercise data comes from the WorkoutX API and nutrition data from the USDA food database, both proxied through secure backend functions. Authentication, storage, and the database are handled on the backend so the app stays fast and secure.

## Status

StrengthStack is actively maintained and evolving. New features get added as I find gaps in my own routine — if something's missing, it's probably on the list.
