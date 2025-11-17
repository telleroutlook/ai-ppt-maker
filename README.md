
# AI Coloring Book Creator

Welcome to the AI Coloring Book Creator! This application allows you to generate personalized, printable coloring books for children. Simply provide a theme and a name, and our AI will create a custom cover and five unique coloring pages, all combined into a downloadable PDF.

## Features

-   **AI-Powered Content:** Generates unique coloring pages based on any theme you can imagine.
-   **Personalization:** Creates a custom cover featuring your child's name.
-   **Print-Ready PDF:** Combines all pages into a single, high-quality PDF, ready for printing.
-   **Thick, Clean Lines:** Images are specifically designed with thick outlines suitable for coloring.
-   **Creative Assistant:** Includes a friendly chatbot to help you brainstorm fun themes.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   A package manager like `npm` or `yarn`

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-coloring-book-creator.git
    cd ai-coloring-book-creator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    This project requires a Google Gemini API key to function.

    -   Create a new file named `.env` in the root of the project.
    -   Copy the contents of `.env.example` into your new `.env` file.
    -   Replace `YOUR_GEMINI_API_KEY` with your actual key.

    Your `.env` file should look like this:
    ```
    API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```
    You can get your Gemini API key from [Google AI Studio](https://ai.google.dev/).

### Running the Application

Once the installation and configuration are complete, you can start the development server:

```bash
npm start
```

This will open the application in your default web browser.

## Technologies Used

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Model:** Google Gemini API (`gemini-2.5-flash` for text, `imagen-4.0-generate-001` for images)
-   **PDF Generation:** jsPDF
