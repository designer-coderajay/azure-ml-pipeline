## The Problem
Jupyter Notebooks are not production. Training a model locally and passing a pickled file to the engineering team via Slack is an unscalable, fragile workflow. When the data inevitably drifts or the model degrades, there is no automated mechanism to retrain, evaluate, and redeploy.

## The Solution
A rigid, automated MLOps pipeline built entirely on Azure Machine Learning SDK v2. We containerize and isolate every step of the machine learning lifecycle. Data preparation, model training, and evaluation run on auto-scaling compute clusters. MLflow tracks every hyperparameter and metric. If a model meets the baseline criteria, the pipeline automatically registers it and exposes it as a live REST API.

## Business Impact
* **Repeatable Scale:** What works on one laptop now works reliably in the cloud. You can retrain on a massive dataset simply by triggering the pipeline.
* **Absolute Traceability:** You know exactly which code, which dataset, and which parameters produced the model currently running in production. 
* **Zero-Downtime Deployment:** Managed endpoints handle the infrastructure, load balancing, and scaling automatically. The engineering team simply hits the `/score` API.

## Architecture

```
## Deep Dive Architecture: Data Ingestion to Live API

A true MLOps architecture operates in two distinct phases: **Model Training Pipeline** (orchestrating the experimentation and training) and **Deployment & Inference** (serving the model to users).

```text
========================================================================
PHASE 1: MODEL TRAINING PIPELINE (Offline / Batch Execution)
========================================================================
[Raw Data (CSV)]         <- Stored in Azure ML Datastore
      │
      ▼
[01_data_prep.py]        <- Compute Cluster executes data cleaning
      │                     Handles missing values, normalizes features
      │                     Outputs Train (80%) and Test (20%) datasets
      ▼
[02_train.py]            <- Compute Cluster executes Scikit-Learn training
      │                     Trains classification algorithm
      │                     MLflow tracks hyperparameters and model weights
      ▼
[03_evaluate.py]         <- Scores model against the Test dataset
      │                     Computes accuracy, precision, and recall
      │                     Outputs metrics.json
      ▼
[04_register.py]         <- Reads metrics.json
      │                     If metrics meet the deployment threshold,
      │                     pushes model.pkl to Azure ML Model Registry
========================================================================

========================================================================
PHASE 2: DEPLOYMENT & INFERENCE (Runtime / Online Execution)
========================================================================
[Azure Model Registry]   <- Holds version-controlled model.pkl
      │                     Linked to a specific Docker environment
      ▼
[Managed Endpoint]       <- Azure provisions dedicated serving compute
      │                     Loads the Docker image and mounts the model
      ▼
[REST API POST Request]  <- Client application sends JSON payload
      │                     (e.g., patient vital statistics)
      ▼
[score.py : init()]      <- Runs once when the container starts
      │                     Deserializes model.pkl into system memory
      ▼
[score.py : run()]       <- Runs on every incoming API request
      │                     Processes JSON payload and calls model.predict()
      ▼
[Final Output]           <- Returns JSON response (e.g., {"prediction": 1})
========================================================================
```

## Azure Services Used

| Service                   | Purpose                          | DP-100 Topic           |
| ------------------------- | -------------------------------- | ---------------------- |
| **Azure ML Workspace**    | Central hub for all ML resources | Workspace management   |
| **Compute Cluster**       | Scalable training compute        | Compute management     |
| **ML Pipelines (SDK v2)** | Orchestrate multi-step workflows | Pipeline design        |
| **MLflow**                | Experiment tracking & logging    | Experiment management  |
| **Model Registry**        | Version & catalog trained models | Model management       |
| **Managed Endpoints**     | Deploy models as REST APIs       | Model deployment       |
| **Environments**          | Reproducible Python environments | Environment management |

## Quick Start

### 1. Azure Setup

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step Azure resource creation.

### 2. Local Setup

```bash
cd project2-azure-ml-pipeline
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Login to Azure
az login

# Configure credentials
cp .env.example .env
# Edit .env with your subscription ID, resource group, workspace name
```

### 3. Run Pipeline

```bash
python src/run_pipeline.py run
```

This submits the pipeline to Azure ML. Watch it in ML Studio!

### 4. Deploy Model

```bash
python src/run_pipeline.py deploy
```

### 5. Test Endpoint

```bash
python src/run_pipeline.py test
```

### 6. Cleanup (stop billing!)

```bash
python src/run_pipeline.py cleanup
```

## Project Structure

```
project2-azure-ml-pipeline/
├── SETUP_GUIDE.md              # Step-by-step Azure Portal instructions
├── .env.example                # Template for workspace config
├── requirements.txt            # Python dependencies
├── src/
│   ├── config.py               # Azure ML workspace connection
│   └── run_pipeline.py         # Pipeline definition + deployment
├── components/                 # Scripts that run IN Azure ML
│   ├── 01_data_prep.py         # Data cleaning & train/test split
│   ├── 02_train.py             # Model training with MLflow
│   ├── 03_evaluate.py          # Evaluation metrics
│   ├── 04_register.py          # Model registration
│   └── score.py                # Scoring script for deployment
└── data/
    └── heart_disease.csv       # Generated dataset
```

## Pipeline Components Explained

| Step | Script            | Input               | Output                | Purpose              |
| ---- | ----------------- | ------------------- | --------------------- | -------------------- |
| 1    | `01_data_prep.py` | Raw CSV             | train.csv, test.csv   | Clean & split data   |
| 2    | `02_train.py`     | train.csv           | model.pkl, scaler.pkl | Train classifier     |
| 3    | `03_evaluate.py`  | model.pkl, test.csv | metrics JSON          | Evaluate performance |
| 4    | `04_register.py`  | model.pkl, metrics  | Registry entry        | Version the model    |
| 5    | `score.py`        | API request         | Prediction            | Serve predictions    |

## Skills Demonstrated

- Azure ML Workspace provisioning and management
- ML Pipeline design with Azure ML SDK v2
- Compute cluster management (auto-scaling, auto-shutdown)
- MLflow experiment tracking (parameters, metrics, artifacts)
- Model Registry for versioning and governance
- Managed Online Endpoints for model serving
- Environment management with conda specifications
- Classification pipeline (data prep → train → evaluate → deploy)
- Production patterns: scoring scripts, input validation, error handling

## Cost Management

⚠️ **Always delete endpoints when not in use!**

```bash
python src/run_pipeline.py cleanup
```

Compute clusters with min_nodes=0 automatically scale down. Endpoints DO NOT. They charge 24/7 until deleted.

## License

MIT
