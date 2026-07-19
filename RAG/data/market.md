# Theoretical & Technical Reference: XAUUSD M15 Mean Reversion Framework

This document provides a comprehensive theoretical and technical breakdown of the XAUUSD M15 Mean Reversion Machine Learning Framework. Designed specifically for Retrieval-Augmented Generation (RAG) engines, it documents the mathematical formulas, statistical methods, validation techniques, and execution logic of the system.

---

## 📖 Table of Contents
1. [Core Financial & Strategy Concepts](#1-core-financial--strategy-concepts)
2. [Data Ingestion & Quality Control Engine](#2-data-ingestion--quality-control-engine)
3. [Mathematical Feature Engineering Specification](#3-mathematical-feature-engineering-specification)
4. [Triple Barrier Method (TBM) Labeling Theory](#4-triple-barrier-method-tbm-labeling-theory)
5. [Stacked Ensemble Machine Learning Theory](#5-stacked-ensemble-machine-learning-theory)
6. [Validation, Purging, & Embargo Mechanics](#6-validation-purging--embargo-mechanics)
7. [Regime Classification & Performance Diagnostics](#7-regime-classification--performance-diagnostics)
8. [RAG Engine Ontology & Indexing Metadata](#8-rag-engine-ontology--indexing-metadata)

---

## 1. Core Financial & Strategy Concepts

### The Mean Reversion Hypothesis
The core strategy operates on the assumption that asset prices deviate from their long-term historical mean due to short-term supply/demand imbalances, order execution clusters, or market overreactions. The price $Y_t$ is assumed to revert to its mean level $\mu$ over time. 

The framework models these dynamics using a continuous-time stochastic differential equation (SDE) known as the **Ornstein-Uhlenbeck (OU) process**:
$$dY_t = \theta(\mu - Y_t) dt + \sigma dW_t$$

Where:
* $Y_t$ is the asset price at time $t$.
* $\theta > 0$ represents the rate of mean reversion (speed of adjustment).
* $\mu$ is the long-term equilibrium mean of the price series.
* $\sigma > 0$ is the volatility parameter.
* $W_t$ is a standard Brownian motion (Wiener process).

### Night-Session Window Mechanics
Intraday markets exhibit distinct regime shifts based on geographic trading hours. The framework targets a specific **Night Window (17:30 to 03:30 UTC)**. 

During the London and early New York sessions (08:00 to 17:00 UTC), capital flows and macroeconomic releases drive trend expansion (high directional momentum). After the US market close and during the Asian session, volatility decreases, and prices tend to consolidate within well-defined support and resistance zones. 

This consolidation phase is highly suitable for mean-reversion models. Trading inside this window avoids the high-slippage environment of major news releases and targets range-bound market conditions.

---

## 2. Data Ingestion & Quality Control Engine

The ingestion pipeline connects to the MetaTrader 5 (MT5) terminal to retrieve M15 historical candlestick bars.

```
[MT5 Terminal API] ──► copy_rates_range ──► In-Memory DataFrame ──► QC Filters ──► Parquet Storage
```

### Ingestion Protocol
* **Historical Horizon:** Pulls a continuous 3-year historical dataset of M15 bars, providing approximately 75,000 candles.
* **Chunking Method:** In case of API rate limits or network issues, the system pulls data in 90-day segments and reconciles them chronologically.
* **De-duplication:** Filters out redundant bars by enforcing a unique index constraint on the UTC timestamp column.

### Data Quality Control Metrics
Before feature engineering, the dataset passes through a quality check pipeline to flag anomalous data:
* **Zero-Volume Bars:** Identifies bars where tick volume is 0 (excluding weekend gaps), which indicates stale quotes or feed outages.
* **Invalid High-Low Relations:** Flags records that violate basic candlestick rules, such as:
  $$High_t < Low_t \quad\text{or}\quad High_t < \max(Open_t, Close_t) \quad\text{or}\quad Low_t > \min(Open_t, Close_t)$$
* **Extreme Range Anomaly:** Filters out candles where the high-low range exceeds the 99.9th percentile of historical distributions, typically caused by bad ticks or data feed errors.
* **Gap Analysis:** Identifies missing data by calculating differences between consecutive timestamps. If the difference $\Delta t > 15 \text{ minutes}$ during trading hours, it flags the interval as an intra-week data gap.

---

## 3. Mathematical Feature Engineering Specification

The system generates technical indicators and statistical metrics from the raw Open, High, Low, Close, Volume (OHLCV) series.

### A. Statistical Mean-Reversion Indicators

#### 1. Hurst Exponent ($H$)
The Hurst exponent quantifies the long-term memory of a time series. It indicates whether the series is mean-reverting, random, or trending.
* **Calculation (Rescaled Range Analysis):**
  For a sub-window of size $d$, calculate the mean-centered cumulative deviation $X_k$ of a series $Z$:
  $$X_{k,d} = \sum_{i=1}^{k} \left( Z_i - \bar{Z}_d \right) \quad \text{for } k=1, \dots, d$$
  Calculate the rescaled range $R(d)/S(d)$, where:
  $$R(d) = \max_{1 \le k \le d} X_{k,d} - \min_{1 \le k \le d} X_{k,d}$$
  $$S(d) = \sqrt{\frac{1}{d} \sum_{i=1}^{d} \left( Z_i - \bar{Z}_d \right)^2}$$
  The Hurst exponent is estimated by fitting a linear regression over different sub-window sizes $d$:
  $$\ln \mathbb{E}\left[ \frac{R(d)}{S(d)} \right] = H \ln(d) + C$$
* **Interpretation:**
  * $H < 0.45$: Mean-reverting.
  * $H \approx 0.50$: Random walk.
  * $H > 0.55$: Trending.

#### 2. Half-Life of Mean Reversion ($HL$)
Estimates the average time it takes for price deviations to decay back to the mean.
* **Calculation:**
  Fits a discrete version of the Ornstein-Uhlenbeck process using an Ordinary Least Squares (OLS) regression on the daily return deviations:
  $$\Delta Y_t = (Y_t - Y_{t-1}) = \beta Y_{t-1} + \alpha + \epsilon_t$$
  Where $\beta = -\theta \Delta t$. If the model finds a negative slope ($\beta < 0$), it calculates the half-life as:
  $$HL = -\frac{\ln(2)}{\beta}$$
  This value is used to dynamically scale the holding time limits (vertical barrier expiration) of the trades.

### B. High-Low Volatility Estimators

Traditional volatility models rely on close-to-close returns, ignoring intraday price movements. The framework uses two high-low range estimators:

#### 1. Parkinson Volatility
Measures variance based on the high-low range under the assumption of continuous price diffusion:
$$\sigma_{P} = \sqrt{\frac{1}{4 \ln(2) \cdot N} \sum_{i=1}^{N} \left(\ln\left(\frac{High_i}{Low_i}\right)\right)^2}$$

#### 2. Garman-Klass Volatility
Extends Parkinson's model by incorporating opening and closing prices to account for overnight price gaps:
$$\sigma_{GK} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \left[ 0.5 \left(\ln\left(\frac{High_i}{Low_i}\right)\right)^2 - (2\ln 2 - 1)\left(\ln\left(\frac{Close_i}{Open_i}\right)\right)^2 \right]}$$

### C. Market Microstructure & Order Flow Features

#### 1. Amihud Illiquidity
Estimates the price impact per unit of volume to detect potential price exhaustion zones:
$$\text{Illiquidity}_t = \frac{|Return_t|}{\text{Volume}_t}$$

#### 2. Liquidity Sweeps
Detects price exhaustion by identifying brief spikes outside of recent trading ranges:
* **High Liquidity Sweep (`is_sweep_high`):** 
  $$High_t > \max_{1 \le i \le 20}(High_{t-i}) \quad\text{and}\quad Close_t < \max_{1 \le i \le 20}(High_{t-i})$$
  This flags a setup where the price briefly broke above the 20-period high but closed back inside the range, indicating selling pressure.
* **Low Liquidity Sweep (`is_sweep_low`):** 
  $$Low_t < \min_{1 \le i \le 20}(Low_{t-i}) \quad\text{and}\quad Close_t > \min_{1 \le i \le 20}(Low_{t-i})$$
  This flags a setup where the price briefly broke below the 20-period low but closed back inside the range, indicating buying pressure.

#### 3. Fair Value Gaps (FVG)
Identifies imbalances where aggressive buying or selling leaves behind an unfilled range:
* **Bullish FVG (`fvg_long`):** $Low_t > High_{t-2}$.
* **Bearish FVG (`fvg_short`):** $High_t < Low_{t-2}$.

### D. Volatility-Adaptive Indicators
* **Bollinger Bands & %B:** Measures price distance from a moving average scaled by standard deviation.
  $$\%B = \frac{Close_t - \text{Lower Band}_t}{\text{Upper Band}_t - \text{Lower Band}_t}$$
* **Keltner Channel Squeeze:** Measures the ratio between Bollinger Bands and Keltner Channels to identify volatility squeezes:
  $$\text{Squeeze On} \iff \text{Bollinger Band}_{Upper} < \text{Keltner Channel}_{Upper} \quad\text{and}\quad \text{Bollinger Band}_{Lower} > \text{Keltner Channel}_{Lower}$$

### E. Macroeconomic & Temporal Context Features
* **Forex Factory Calendar Parsing:** Downloads the Forex Factory weekly XML calendar to track USD high-impact events. It calculates two continuous distance features:
  * $t_{\text{next}}$: Minutes until the next high-impact news release.
  * $t_{\text{last}}$: Minutes since the last high-impact news release.
  * `is_high_impact_news_window`: Binary flag set to 1 if $t_{\text{next}} \le 45 \text{ minutes}$ or $t_{\text{last}} \le 15 \text{ minutes}$, and 0 otherwise.
* **Temporal Encoding:** Standard integer representations of time can cause boundary discontinuities. The framework projects timestamps into a circle using sine and cosine transformations:
  $$\text{Hour}_{\sin} = \sin\left(\frac{2 \pi \cdot \text{Hour}}{24}\right), \quad \text{Hour}_{\cos} = \cos\left(\frac{2 \pi \cdot \text{Hour}}{24}\right)$$
  $$\text{DOW}_{\sin} = \sin\left(\frac{2 \pi \cdot \text{DayOfWeek}}{5}\right), \quad \text{DOW}_{\cos} = \cos\left(\frac{2 \pi \cdot \text{DayOfWeek}}{5}\right)$$

---

## 4. Triple Barrier Method (TBM) Labeling Theory

Traditional labeling strategies classification models label returns as $+1$ or $-1$ based on whether the price is higher or lower at a fixed horizon $t+h$. This method does not reflect real-world trading constraints like stop-loss and profit-taking limits. 

The framework uses the **Triple Barrier Method** to generate path-dependent labels.

```
                  Profit-Taking Barrier (Price + Pt * ATR)
     Price  ┌─────────────────────────────────────────────────── [Hit: Label = 1]
            │          *   *
            │       *         *
            │*   *               *
     ───────┼─────────────────────────────────────────────────── Time Expiration (Label = 0)
            │                         *
            │                            *
            │                               *
            └─────────────────────────────────────────────────── [Hit: Label = 0]
                  Stop-Loss Barrier (Price - Sl * ATR)
```

### Barrier Configurations
At each candle index $t$, the framework sets three barriers:
1. **Upper Barrier (Profit-Taking):**
   $$P_{\text{upper}} = Close_t + K_{\text{PT}} \cdot ATR_{14, t}$$
2. **Lower Barrier (Stop-Loss):**
   $$P_{\text{lower}} = Close_t - K_{\text{SL}} \cdot ATR_{14, t}$$
3. **Vertical Barrier (Time Limit):**
   $$\tau = t + N_{\text{max\_bars}}$$

Where $K_{\text{PT}}$ is the profit-target multiplier (default: $1.5$), $K_{\text{SL}}$ is the stop-loss multiplier (default: $1.0$), and $N_{\text{max\_bars}}$ is the maximum holding period (default: $48$ bars, equivalent to 12 hours).

### Label Assignment Rule
Let $t^*$ be the first index in the interval $[t+1, t+N_{\text{max\_bars}}]$ where the price touches a barrier:
$$y_t = \begin{cases} 
1 & \text{if } High_{t^*} \ge P_{\text{upper}} \quad\text{and}\quad Low_{t^*} > P_{\text{lower}} \\
0 & \text{if } Low_{t^*} \le P_{\text{lower}} \quad\text{and}\quad High_{t^*} < P_{\text{upper}} \\
0 & \text{if } t^* = t + N_{\text{max\_bars}} \quad\text{and no barrier is hit}
\end{cases}$$

This configuration trains the model as a binary classifier that predicts whether a setup will hit its profit target before hitting its stop-loss or expiring.

---

## 5. Stacked Ensemble Machine Learning Theory

The model uses a stacked classifier ensemble to combine different learning algorithms and reduce prediction variance.

```
[Input Features]
       │
       ├─► Base Learner 1: LightGBM (Gradient Boosting with Histogram Bins)
       ├─► Base Learner 2: XGBoost  (Regularized Newton Boosting Trees)
       │
       ▼ (Out-of-Fold Probabilities)
[Meta-Learner: Logistic Regression Stacker]
       │
       ▼
[Calibrated Probability output P(y=1|X)]
       │
       ▼ (Apply Precision-at-Recall Threshold)
[Execution Decision (0 or 1)]
```

### Base Learners

#### 1. LightGBM (Light Gradient Boosting Machine)
* **Characteristics:** Grow trees leaf-wise (best-first) rather than level-wise, optimizing for loss reduction. It uses Gradient-Based One-Side Sampling (GOSS) and Exclusive Feature Bundling (EFB) to speed up training.
* **Loss Function Optimization:** Minimizes binary cross-entropy loss, weighted by the class imbalance ratio:
  $$w = \frac{N_{\text{negatives}}}{N_{\text{positives}}}$$
  This scaling factor (`scale_pos_weight`) adjusts the loss contribution of positive instances to prevent bias towards the majority class.

#### 2. XGBoost (Extreme Gradient Boosting)
* **Characteristics:** Grows trees level-wise and applies L1 (Lasso) and L2 (Ridge) regularization to control model complexity and prevent overfitting.
* **Objective Function:**
  $$\mathcal{L}^{(t)} = \sum_{i=1}^{n} l\left(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)\right) + \Omega(f_t)$$
  Where $\Omega(f) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^{T} w_j^2$ is the tree complexity penalty.

### Meta-Learner Stacking
Predictions from the base models are combined using a logistic regression meta-classifier.
1. The base classifiers generate out-of-fold probability predictions on the training data:
   $$\hat{P}_{\text{LGBM}}(x_i) \quad\text{and}\quad \hat{P}_{\text{XGB}}(x_i)$$
2. The meta-classifier learns the optimal weights to blend these predictions:
   $$z_i = \beta_0 + \beta_1 \hat{P}_{\text{LGBM}}(x_i) + \beta_2 \hat{P}_{\text{XGB}}(x_i)$$
   $$\hat{P}_{\text{stacked}}(x_i) = \frac{1}{1 + e^{-z_i}}$$

### Threshold Calibration (Precision-at-Recall)
Using a default threshold of $0.5$ for trade execution is often sub-optimal, as false positives (losing trades) carry a high capital cost. The framework optimizes the decision threshold using a precision-at-recall target:
$$\max_{\text{threshold}} \text{Precision}(\text{threshold}) \quad \text{subject to} \quad \text{Recall}(\text{threshold}) \ge 0.10$$

This constraint ensures that the model only executes trades with high probability of success, while maintaining a minimum trade frequency (recalling at least 10% of positive setups).

---

## 6. Time-Series Validation & Leakage Prevention Theory

Applying standard cross-validation to financial time series can cause lookahead bias and overfitting due to overlapping labels and serial correlation.

```
Overlap Leakage:
Label at t   [─── Window of 48 bars ───]
Label at t+1   [─── Window of 48 bars ───]
               ^-- Overlap contains shared future price data --^
```

### Purged Walk-Forward Cross-Validation
The framework implements a purged walk-forward cross-validation strategy (`PurgedWalkForwardCV`) to prevent leakage:

```
Train Fold: [─── Train Range ───]
Purge Zone:                     [── Purge (48 bars) ──]
Test Fold:                                            [─── Test Range ───]
Embargo Zone:                                                            [── Embargo (12 bars) ──]
```

1. **Purging:** 
   When splitting the data into training and test folds, any training sample whose label evaluation window overlaps with the test set is removed. The purge window length is set to the maximum holding time of the Triple Barrier Method:
   $$N_{\text{purge}} = N_{\text{max\_bars}} = 48 \text{ bars}$$
2. **Embargoing:**
   Since financial returns exhibit serial correlation (autoregressive properties), data points immediately following the test set can leak information back into the training set. The framework removes samples from the start of the post-test training set:
   $$N_{\text{embargo}} = 12 \text{ bars (3 hours)}$$

### Feature Stability Filter
To prevent the model from selecting features that only work on specific market regimes, the system filters out unstable features:
1. Calculates feature importances across all 5 cross-validation folds.
2. Identifies the top 25 features for each fold.
3. Only retains features that appear in the top 25 in at least 3 out of 5 folds (`MIN_FEATURE_STABILITY`). Unstable features are discarded before final model training.

---

## 7. Regime Classification & Performance Diagnostics

A model's performance can degrade under changing market conditions. The evaluation engine runs diagnostics across two distinct market regime filters:

### 1. Trend Regime (ADX Filter)
The Average Directional Index (ADX) measures trend strength. The framework splits the test set into three trend regimes:
* **Ranging Regime:** $\text{ADX} < 20$. High probability of mean reversion.
* **Trending Regime:** $\text{ADX} \ge 25$. High risk of breakout expansions.
* **Strong Trend Regime:** $\text{ADX} \ge 40$. Extreme momentum, high risk of stop-loss breach.

### 2. Volatility Regime (ATR Z-Score Filter)
Calculates the standard score of the 14-period Average True Range against its 100-period historical distribution:
$$ATR_{\text{zscore}, t} = \frac{ATR_{14, t} - \text{Mean}(ATR_{14, t-100 \dots t})}{\text{StdDev}(ATR_{14, t-100 \dots t})}$$

The test set is segmented into:
* **Low Volatility Regime:** $ATR_{\text{zscore}} < -0.5$. Indicative of quiet, ranging markets.
* **High Volatility Regime:** $ATR_{\text{zscore}} > 0.5$. Indicative of high-momentum news releases or market opens.

### Overfitting Detection
The system flags potential overfitting by checking the performance gap between the validation splits:
$$\text{Overfit Flag} = 1 \iff \left( \text{AUC}_{\text{train}} - \text{AUC}_{\text{val}} > 0.10 \right) \quad\text{or}\quad \left( \text{AUC}_{\text{train}} - \text{AUC}_{\text{test}} > 0.12 \right)$$

---

## 8. RAG Engine Ontology & Indexing Metadata

This ontology index provides semantic keys to help RAG vector search engines retrieve relevant information from this document:

```json
{
  "project_name": "ML_forex_Framework",
  "strategy_type": "Swing Mean Reversion",
  "asset_class": "Contracts for Difference (CFDs)",
  "target_instrument": "Gold (XAUUSD)",
  "timeframe": "M15 (15-Minute Candlesticks)",
  "session_filter": "Night Window (17:30 - 03:30 UTC)",
  "mathematical_models": [
    "Ornstein-Uhlenbeck Process",
    "Hurst Exponent R/S Analysis",
    "Parkinson Variance Estimator",
    "Garman-Klass Volatility Estimator"
  ],
  "machine_learning_architecture": {
    "ensemble_type": "Stacked Classifier",
    "base_learners": ["LightGBM", "XGBoost"],
    "meta_learner": "Logistic Regression",
    "optimization_metric": "Area Under ROC Curve (AUC)",
    "threshold_policy": "Precision-at-Recall (Min Recall 10%)"
  },
  "validation_protocols": [
    "Purged Walk-Forward Cross Validation",
    "Label Purging (48 bars)",
    "Test Embargoing (12 bars)",
    "Feature Stability Filtering"
  ],
  "labeling_strategy": "Triple Barrier Method (TBM)",
  "microstructure_signals": [
    "Liquidity Sweeps (20-period)",
    "Fair Value Gaps (FVG)",
    "Amihud Price Impact Illiquidity"
  ],
  "data_quality_controls": [
    "Zero-Volume Filtering",
    "Candlestick Rule Compliance Checking",
    "99.9th Percentile Range Outlier Filtering"
  ]
}
```
