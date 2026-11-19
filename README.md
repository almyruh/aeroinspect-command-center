# AeroInspect AI
### Aerospace Component Visual Inspection Prototype

AeroInspect AI is a web-based visual inspection prototype designed to process aerospace component images and highlight candidate surface regions for further inspection.

## Features

- Upload component images (JPG, PNG, WEBP)
- OpenCV-based image processing
- Canny edge detection and contour analysis
- Candidate region bounding-box visualization
- Original vs. annotated image comparison
- Image metrics, including dimensions, mean brightness and edge pixel ratio
- Inspection history saved locally in the browser
- CSV inspection report export

## Technology Stack

- **Frontend:** Lovable
- **Backend:** Python, FastAPI
- **Computer Vision:** OpenCV, NumPy
- **Deployment:** Vercel

## Live Demo

[Open AeroInspect AI](https://lovable.dev/projects/ee2edb62-6a7d-4884-8153-ea93b0cbbe9e)

## Backend API

- Health check: `https://aeroinspect-ai-backend.vercel.app/health`
- Inspection endpoint: `POST https://aeroinspect-ai-backend.vercel.app/inspect`

## How It Works

1. Upload an aerospace component image.
2. The backend processes the image using OpenCV.
3. Edge detection and contour analysis identify candidate regions.
4. Bounding boxes are drawn around detected regions.
5. Image metrics and inspection results are returned to the dashboard.
6. Results can be reviewed and exported as a CSV report.

## Important Technical Disclaimer

This is an experimental computer-vision prototype. Candidate regions are generated through traditional OpenCV image-processing techniques. They are not confirmed defects.

The current implementation does not use a trained machine-learning defect-classification model and is not certified for operational aerospace inspection or airworthiness decisions.

## Project Objective

To develop a foundation for an aerospace visual-inspection workflow and demonstrate practical skills in Python, computer vision, API development and frontend-backend integration.
