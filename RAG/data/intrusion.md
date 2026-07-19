# Intelligent Intrusion Detection System (IIDS) & Guard Up HUD

IIDS (Intelligent Intrusion Detection System), commercially styled as **Guard Up**, is a state-of-the-art Computer Vision surveillance system designed for edge deployment (e.g., Raspberry Pi, local servers) and real-time security management. The system utilizes a dual-tier verification architecture—combining lightweight pixel-motion filters, custom transfer-learned deep neural networks, and real-time YOLOv8 object recognition—to detect unauthorized personnel and identify brandished weapons while minimizing resource consumption.

---

## 📖 Table of Contents
1. [Fundamentals & Architecture Design](#1-fundamentals--architecture-design)
2. [Dual-Pipeline Core Engineering](#2-dual-pipeline-core-engineering)
3. [File Structure & Directory Hierarchies](#3-file-structure--directory-hierarchies)
4. [Component Walkthrough & Script Actions](#4-component-walkthrough--script-actions)
5. [Smart Threat Assessment & Overlap Math](#5-smart-threat-assessment--overlap-math)
6. [Model Architecture & Training Parameters](#6-model-architecture--training-parameters)
7. [Alerting & Notification Engine](#7-alerting--notification-engine)
8. [Streamlit HUD Dashboard Architecture](#8-streamlit-hud-dashboard-architecture)
9. [Deployment & Configuration Guide](#9-deployment--configuration-guide)
10. [RAG Engine Quick Reference & Keyword Index](#10-rag-engine-quick-reference--keyword-index)

---

## 1. Fundamentals & Architecture Design

### The Core Problem in Edge AI Surveillance
Traditional computer vision alert systems suffer from two main issues:
1. **High False-Alarm Rates:** Traditional motion detectors trigger on simple lighting changes, shadows, or insects.
2. **High CPU/GPU Thermal Throttling:** Running deep learning models (like YOLO or MobileNet) continuously on every frame of a high-resolution video stream consumes excessive power and degrades edge hardware like the Raspberry Pi.

### IIDS Hybrid Solution
IIDS resolves this with a **Dual-Pipeline / Tiered Verification** approach:

```
[Camera Feed / Video Stream]
            │
            ▼
┌───────────────────────────┐
│  Tier 1: Motion Filter    │ ◄─── Run continuously (extremely fast, low CPU)
│  (OpenCV frame contours)  │
└─────────────┬─────────────┘
              │ Contours found?
              ├──► [NO] ──► Skip ML processing (Remain Idle)
              └──► [YES] 
                    │
                    ▼
┌───────────────────────────┐
│ Tier 2: ML Classifier     │
│ (MobileNetV2 h5/TFLite)   │ ◄─── Run only when motion occurs (saves power)
└─────────────┬─────────────┘
              │ Prediction > 80%?
              ├──► [NO] ──► False Alarm (Logs ignored)
              └──► [YES] 
                    │
                    ▼
┌───────────────────────────┐
│     Intrusion Confirmed   │ ──► Save Evidence Frame
└─────────────┬─────────────┘ ──► Trigger Telegram Notification (notifier.py)
              │
              ▼
┌───────────────────────────┐
│ YOLOv8 Cognitive Overlay  │ ◄─── Streamlit HUD Active Check
│ (Handheld Threat check)   │      (Identifies weapons like knives, guns, scissors)
└───────────────────────────┘
```

---

## 2. Dual-Pipeline Core Engineering

### Pipeline A: The Low-Power Alarm (`detector.py`)
This pipeline runs as a background process or daemon. It utilizes a two-tier verification:
1. **Tier 1 (Motion Pre-Filter):** Evaluates consecutive frames using OpenCV. If the number of moving contours is zero, the system halts processing for that frame.
2. **Tier 2 (Deep Learning Verification):** If motion is detected, the frame is processed by a custom binary classifier model (`models/intrusion_model.h5` or `models/intrusion_model.tflite`). If human presence is predicted above `THRESHOLD = 0.8`, an alert is dispatched.

### Pipeline B: The Interactive Guard Up HUD (`dashboard.py`)
This pipeline runs in parallel or as a control center. It connects to the stream and runs real-time object tracking:
1. **YOLOv8 Integration:** Uses `yolov8n.pt` (nano version) to detect 80 standard classes including `person`, `knife`, `scissors`, and `suitcase`.
2. **Handheld Threat Analysis:** Computes spatial overlap to detect if a dangerous object is held by a person.
3. **Analytics Aggregation:** Surfaces performance statistics (CPU health, alerts over time, pie logs) and stores captured object images in a web gallery.

---

## 3. File Structure & Directory Hierarchies

The project is structured to isolate data outputs, model checkpoints, and source scripts:

```
Intrusion/
├── data/
│   ├── positive/                  # Collector folder: Person / Intruder frames
│   ├── negative/                  # Collector folder: Empty room / Normal frames
│   ├── proof/                     # Automated evidence screenshots (intrusion detections)
│   ├── objects/                   # Streamlit HUD cropped threat object gallery
│   └── intrusion_*.jpg            # Historical alert snapshots
├── models/
│   ├── intrusion_model.h5         # Compiled TensorFlow/Keras MobileNetV2 model
│   └── intrusion_model.tflite     # Quantized TF Lite model optimized for Raspberry Pi
├── src/
│   ├── data/
│   │   ├── proof/                 # Alternative evidence folder
│   │   └── recordings/            # Alternative video recordings folder
│   ├── capture.py                 # Manual dataset collector script
│   ├── seed_data.py               # Downloader for sample training data
│   ├── train.py                   # Transfer-learning training and compilation script
│   ├── detector.py                # Standalone edge detector daemon
│   ├── notifier.py                # Telegram Bot API notification script
│   └── dashboard.py               # Streamlit HUD GUI and YOLOv8 analyzer
└── .gitignore                     # Git filter for models, environment, and cache
```

---

## 4. Component Walkthrough & Script Actions

### A. Data Seeding (`src/seed_data.py`)
Since starting a camera training workflow requires a clean dataset, `seed_data.py` populates training folders with representative high-quality surveillance images from Unsplash:
* **Positive Samples:** 10 images containing people standing, profiles, faces, and office personnel.
* **Negative Samples:** 10 images representing empty halls, living areas, hallways, and kitchen corridors.
* **Process:** Uses `requests` to download streams and write them as `.jpg` files, enforcing a 1-second delay between queries to respect server rate-limits.

### B. Manual Collection (`src/capture.py`)
Allows operators to capture custom environmental datasets from their local setup:
* Establishes a connection to the camera stream (default: `http://192.0.0.4:8080/video`).
* Opens an interactive window `IIDS Data Collection`.
* **Controls:** 
  * Press **`p`** to save the current frame as `data/positive/pos_<timestamp>.jpg`.
  * Press **`n`** to save the current frame as `data/negative/neg_<timestamp>.jpg`.
  * Press **`q`** to safely release the camera stream and close OpenCV GUI buffers.

### C. Alert Verification Daemon (`src/detector.py`)
The primary monitoring script. It handles stream feeds, motion checking, binary classification, and alert triggers:
1. Opens connection to `IP_CAMERA_URL`.
2. Compares two consecutive frames to extract moving contours.
3. If contours are found, it crops and resizes the image to $(224, 224)$, normalizes pixel values to $[0, 1]$, and runs predictions through the Keras model.
4. If output probability $> 0.8$, it writes a local file `data/intrusion_<timestamp>.jpg`.
5. Imports `notifier.send_alert` to forward the image and text message to Telegram, and triggers a 10-second `ALERT_COOLDOWN` to prevent notification floods.

### D. Streamlit Dashboard GUI (`src/dashboard.py`)
An interactive monitoring dashboard. It launches a web server displaying real-time system stats, live stream frames, cropped objects, and Plotly visualization charts.

---

## 5. Smart Threat Assessment & Overlap Math

To detect weapons held by individuals, `dashboard.py` runs a bounding box overlap algorithm:

```
 Bounding Box overlap evaluation:
 ┌──────────────────────────┐
 │ Person Bounding Box      │
 │  (px1, py1)              │
 │      ┌──────────┐        │
 │      │ Object   │        │
 │      │ Box      │        │
 │      │  (ox_mid,│        │
 │      │   oy_mid)│        │
 │      └──────────┘        │
 │              (px2, py2)  │
 └──────────────────────────┘
```

1. **Model Output:** YOLOv8 detects bounding boxes in the formats:
   * Person Bounding Box: $[px_1, py_1, px_2, py_2]$
   * Object Bounding Box: $[ox_1, oy_1, ox_2, oy_2]$
2. **Center Computation:** The algorithm computes the center coordinates of the detected object:
   $$ox_{\text{mid}} = \frac{ox_1 + ox_2}{2}$$
   $$oy_{\text{mid}} = \frac{oy_1 + oy_2}{2}$$
3. **Intersection Assertion (`check_handheld`):** The system checks if the center point of the object box falls inside the boundaries of the person box:
   $$px_1 < ox_{\text{mid}} < px_2 \quad \text{and} \quad py_1 < oy_{\text{mid}} < py_2$$
4. **Threat Level Assignment:**
   * **Threat Level 3 (Critical):** A person is detected, an object overlaps with them, and the object class is `knife`, `scissors`, or `gun`.
   * **Threat Level 1 (Personnel):** A person is detected, but no dangerous object overlap is found.
   * **Threat Level 0 (Normal):** No people or active threats are found in the monitored zone.

---

## 6. Model Architecture & Training Parameters

The custom classification model is defined and trained via `src/train.py`.

### A. MobileNetV2 Transfer Learning Architecture
* **Base Model:** MobileNetV2 pre-trained on ImageNet. All convolutional layers are frozen (`trainable = False`) to preserve feature extraction filters and allow fast, low-epoch training.
* **Input Shape:** $(224, 224, 3)$
* **Top Classification Head Layers:**
  1. **`GlobalAveragePooling2D`**: Flattens the output feature maps of the convolutional base to a single vector without adding parameters.
  2. **`Dense(512 units, ReLU)`**: Fully connected intermediate representation layer.
  3. **`Dropout(0.5)`**: Prevents overfitting on small datasets.
  4. **`Dense(1 unit, Sigmoid)`**: Final classification node outputting probability between 0.0 (empty room) and 1.0 (intruder present).

### B. Training Configuration
* **Loss Function:** Binary Cross-Entropy (`binary_crossentropy`).
* **Optimizer:** Adam.
* **Epochs:** 10.
* **Batch Size:** 4.
* **Validation Split:** 20% validation split managed by Keras `ImageDataGenerator`.
* **Data Augmentation Parameters:**
  * Rescaling: `1.0 / 255.0`
  * Rotation Range: $\pm20^\circ$
  * Horizontal Flip: Enabled
  * Width & Height Shift: $\pm20\%$

### C. TF Lite Conversion
To support smooth, low-latency execution on edge hardware, the trained Keras model is converted to a FlatBuffer format (`models/intrusion_model.tflite`):
```python
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
```

---

## 7. Alerting & Notification Engine

The system's alert engine (`src/notifier.py`) sends notifications to security operators via Telegram:
1. **Telegram API Endpoint:** Posts requests directly to:
   * Text alerts: `https://api.telegram.org/bot<token>/sendMessage`
   * Image alerts: `https://api.telegram.org/bot<token>/sendPhoto`
2. **Parameters:**
   * `TELEGRAM_TOKEN`: Bot token generated via Telegram's `@BotFather`.
   * `CHAT_ID`: Destination group chat or user ID.
3. **Payload Structure:**
   * Text payloads use JSON strings containing the message.
   * Image payloads use `multipart/form-data` with the image binary mapped under the `photo` field and the text string mapped under `caption`.
4. **Fallback Handling:** If `TELEGRAM_TOKEN` retains the default placeholder value (`"YOUR_BOT_TOKEN"`), the alert module logs a console warning and exits cleanly, avoiding runtime crashes.

---

## 8. Streamlit HUD Dashboard Architecture

`dashboard.py` manages UI state and real-time inference loop:

### Asynchronous Streaming (`VideoStream`)
To prevent camera access blocking the Streamlit UI thread, the capture loop is isolated in a separate thread:
```python
class VideoStream:
    def __init__(self, src=0):
        self.cap = cv2.VideoCapture(src)
        self.ret, self.frame = self.cap.read()
        self.stopped = False
    ...
    def start(self):
        threading.Thread(target=self.update, args=(), daemon=True).start()
        return self
```
This ensures frames are read in the background, allowing the dashboard UI to remain responsive.

### Dashboard Compartments
1. **💻 DASHBOARD:** Monitors key metrics (Active Alerts, System Health, Personnel, Threat Frequency) alongside Plotly charts mapping threat level over time, zone distributions, and type counts.
2. **🔍 OBJECT GALLERY:** Displays cropped snippets of detected objects (weapons show a "🤝" hand symbol indicating a handheld threat).
3. **🔴 LIVE LINK:** Shows the live webcam or IP Camera feed.
4. **⚙️ SYSTEM:** Monitored via `psutil` to trace CPU loads.

---

## 9. Deployment & Configuration Guide

### System Dependencies
Ensure your machine is equipped with Python 3.8+ and C++ build tools (required for compiles like `psutil` and `cv2`).

### Installation
1. Clone the project and navigate to the directory:
   ```bash
   cd Intrusion
   ```
2. Install Python dependencies:
   ```bash
   pip install opencv-python tensorflow numpy requests streamlit pandas plotly ultralytics psutil
   ```

### Execution Steps

#### Step 1: Prepare the Dataset
* To use sample data, run:
  ```bash
  python src/seed_data.py
  ```
* Alternatively, run the capture utility to gather custom frames:
  ```bash
  python src/capture.py
  ```

#### Step 2: Train the Model
Train the MobileNetV2 binary classifier and generate the TF Lite model:
```bash
python src/train.py
```

#### Step 3: Run the Edge Detector
To run the background monitoring daemon, configure your Telegram Bot token in `src/notifier.py` and start the detector:
```bash
python src/detector.py
```

#### Step 4: Run the Streamlit Dashboard HUD
Launch the monitoring dashboard:
```bash
streamlit run src/dashboard.py
```
Open `http://localhost:8501` in your browser to view the HUD.

---

## 10. Document Indexing Reference (RAG Quick Reference)

This quick reference index helps LLM RAG engines map terminology and configurations:

* **Detection Daemon Script:** `src/detector.py`
* **Train Script:** `src/train.py`
* **Data Seeding Script:** `src/seed_data.py`
* **Manual Data Capture Script:** `src/capture.py`
* **Alert Notifier Script:** `src/notifier.py`
* **Streamlit HUD Script:** `src/dashboard.py`
* **Model Checkpoints:** `models/intrusion_model.h5` (Keras), `models/intrusion_model.tflite` (TF Lite).
* **YOLOv8 Weights:** `yolov8n.pt` (Nano).
* **Default IP webcam address:** `http://192.0.0.4:8080/video`
* **Model input dimension:** $(224, 224, 3)$
* **Classification Head Parameters:** GlobalAveragePooling2D, Dense (512, ReLU), Dropout (0.5), Dense (1, Sigmoid).
* **Handheld Overlap Weapons Classes:** `knife`, `scissors`, `gun`.
* **Standard Dataset directories:** `data/positive/` (Intrusions), `data/negative/` (Empty space), `data/proof/` (Saved alarms), `data/objects/` (HUD crops).
* **Inference Alert Cooldown:** `ALERT_COOLDOWN = 10` seconds.
* **Notification API endpoints:** `/bot<token>/sendMessage`, `/bot<token>/sendPhoto`.
* **Streamlit UI Port:** `8501`.
