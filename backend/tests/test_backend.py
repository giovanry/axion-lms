import pytest
from backend.app.core.database import init_db
from backend.app.models.schema import CodeforcesProblem
from backend.app.services.codeforces_service import fetch_or_get_problem, seed_initial_problems
from backend.app.services.curriculum_service import get_curriculum_tree, mark_lesson_complete, sync_curriculum_to_db
from backend.app.services.execution_service import execute_codeforces_solution, execute_python_script
from backend.olympus_tracker import track_accuracy
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    from backend.app.api.routes import seed_initial_leaderboard_data
    init_db()
    sync_curriculum_to_db()
    seed_initial_problems()
    seed_initial_leaderboard_data()


def test_script_execution_pass():
    code = "def add(a, b):\n    return a + b\n"
    test_code = "assert add(2, 3) == 5\nassert add(-1, 1) == 0"
    res = execute_python_script(code=code, test_code=test_code, timeout_seconds=5)
    assert res.success is True
    assert res.passed_asserts is True
    assert res.exit_code == 0


def test_script_execution_fail():
    code = "def add(a, b):\n    return a - b\n"
    test_code = "assert add(2, 3) == 5"
    res = execute_python_script(code=code, test_code=test_code, timeout_seconds=5)
    assert res.success is False
    assert res.passed_asserts is False
    assert "AssertionError" in res.stderr


def test_codeforces_solution_execution():
    # Solution for 4A Watermelon
    cf_solution = (
        "import sys\n"
        "w = int(sys.stdin.read().strip())\n"
        "if w > 2 and w % 2 == 0:\n"
        "    print('YES')\n"
        "else:\n"
        "    print('NO')\n"
    )
    test_cases = [
        {"input": "8\n", "output": "YES\n"},
        {"input": "2\n", "output": "NO\n"},
    ]
    res = execute_codeforces_solution(code=cf_solution, test_cases=test_cases, timeout_seconds=2)
    assert res.verdict == "ACCEPTED"
    assert res.all_passed is True
    assert len(res.results) == 2


def test_codeforces_wrong_answer():
    bad_solution = "print('YES')\n"
    test_cases = [
        {"input": "8\n", "output": "YES\n"},
        {"input": "2\n", "output": "NO\n"},
    ]
    res = execute_codeforces_solution(code=bad_solution, test_cases=test_cases, timeout_seconds=2)
    assert res.verdict == "WRONG_ANSWER"
    assert res.all_passed is False
    assert res.results[1].passed is False


@pytest.mark.asyncio
async def test_codeforces_seeded_problem_fetch():
    prob = await fetch_or_get_problem("4A")
    assert prob is not None
    assert prob["id"] == "4A"
    assert "Watermelon" in prob["title"]
    assert prob["statement_id"] is not None


def test_curriculum_and_streak():
    tree = get_curriculum_tree()
    assert len(tree) >= 3
    result = mark_lesson_complete("py_01_syntax")
    assert result["is_completed"] is True
    assert result["daily_streak"] >= 1


def test_experiment_tracking():
    entry = track_accuracy(
        model_name="PyTorch_CNN_Baseline",
        accuracy=0.942,
        f1=0.938,
        parameters={"lr": 0.001, "batch_size": 32},
    )
    assert entry.id is not None
    assert entry.accuracy_score == 0.942


def test_notebook_lifecycle():
    from backend.app.core.database import get_session
    from backend.app.api.routes import create_notebook, get_notebook, update_notebook, list_notebooks

    session = next(get_session())
    created = create_notebook(
        payload={"title": "Iris EDA Test Notebook", "dataset_ref": "uciml/iris"},
        session=session,
    )
    nb_id = created["id"]
    assert nb_id is not None
    assert created["title"] == "Iris EDA Test Notebook"
    assert len(created["cells"]) >= 2

    # Fetch notebook
    detail = get_notebook(notebook_id=nb_id, session=session)
    assert detail["id"] == nb_id
    assert detail["title"] == "Iris EDA Test Notebook"

    # Update cells
    updated = update_notebook(
        notebook_id=nb_id,
        payload={
            "title": "Iris EDA Updated",
            "cells": [
                {"id": "c1", "type": "code", "content": "import pandas as pd", "output": "", "execution_count": 1}
            ],
        },
        session=session,
    )
    assert updated["id"] == nb_id

    # Verify listing
    all_nb = list_notebooks(session=session)
    assert any(n["id"] == nb_id for n in all_nb)


@pytest.mark.asyncio
async def test_add_codeforces_problem_cache():
    from backend.app.api.routes import add_codeforces_problem
    # Add an existing seeded problem like 4A or 71A
    res = await add_codeforces_problem({"problem_id": "4A"})
    assert res is not None
    assert res["id"] == "4A"
    assert "Watermelon" in res["title"]


def test_leaderboard_by_dataset_grouping():
    from backend.app.core.database import get_session
    from backend.app.api.routes import list_leaderboard_by_dataset
    from backend.olympus_tracker import track_accuracy

    session = next(get_session())
    # Initial state: competitions exist
    datasets = list_leaderboard_by_dataset(session=session)
    assert len(datasets) >= 2
    for d in datasets:
        assert "dataset_ref" in d
        assert "best_accuracy" in d
        assert "total_models" in d

    # Track two solution versions for iris
    track_accuracy(
        model_name="Baseline_Model",
        accuracy=0.88,
        solution_version="v1.0 - Baseline",
        dataset_ref="uciml/iris",
        pipeline_flow="Imputer → Baseline",
    )
    track_accuracy(
        model_name="Tuned_Ensemble",
        accuracy=0.97,
        solution_version="v2.0 - Stacking",
        dataset_ref="uciml/iris",
        pipeline_flow="PCA → Optuna → Stacking",
    )

    datasets = list_leaderboard_by_dataset(session=session)
    iris = next(d for d in datasets if d["dataset_ref"] == "uciml/iris")
    assert len(iris["runs"]) >= 2
    assert iris["best_accuracy"] >= 0.97
    assert iris["best_model"] in ["Tuned_Ensemble", "Custom_Ensemble_V2"]
    assert iris["best_version"] in ["v2.0 - Stacking", "v1.0"]
    # verify sorted by accuracy descending
    accs = [r["accuracy_score"] for r in iris["runs"]]
    assert accs == sorted(accs, reverse=True)
    assert iris["runs"][0]["rank"] == 1
    assert iris["runs"][0]["is_best"] is True
    assert iris["runs"][0]["solution_version"] in ["v2.0 - Stacking", "v1.0"]


def test_track_accuracy_with_pipeline_flow():
    from backend.olympus_tracker import track_accuracy

    entry = track_accuracy(
        model_name="Custom_Ensemble_V2",
        accuracy=0.975,
        f1=0.971,
        dataset_ref="uciml/iris",
        pipeline_flow="QuantileTransformer → FeatureUnion → StackingClassifier",
        parameters={"cv": 5, "base_learners": ["rf", "xgb"]},
    )
    assert entry.id is not None
    assert entry.accuracy_score == 0.975
    assert "StackingClassifier" in entry.parameters_json
    assert "uciml/iris" in entry.parameters_json


def test_get_codeforces_problemset():
    client = TestClient(app)
    res = client.get("/api/v1/codeforces/problemset?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "problems" in data
    assert isinstance(data["problems"], list)


def test_pagination_and_query_limits():
    client = TestClient(app)
    # 1. Notebooks pagination
    res_nb = client.get("/api/v1/notebooks?limit=2&offset=0")
    assert res_nb.status_code == 200
    data_nb = res_nb.json()
    assert isinstance(data_nb, list)
    assert len(data_nb) <= 2

    # 2. Local datasets pagination
    res_ds = client.get("/api/v1/datasets/local?limit=2&offset=0")
    assert res_ds.status_code == 200
    data_ds = res_ds.json()
    assert isinstance(data_ds, list)
    assert len(data_ds) <= 2

    # 3. Codeforces problems pagination
    res_cf = client.get("/api/v1/codeforces/problems?limit=3&offset=0")
    assert res_cf.status_code == 200
    data_cf = res_cf.json()
    assert isinstance(data_cf, list)
    assert len(data_cf) <= 3

    # 4. Leaderboard pagination
    res_lb = client.get("/api/v1/leaderboard?limit=2&offset=0")
    assert res_lb.status_code == 200
    data_lb = res_lb.json()
    assert isinstance(data_lb, list)
    assert len(data_lb) <= 2


def test_in_memory_cache_layer():
    from backend.app.core.cache import memory_cache
    import time

    memory_cache.set("test_key", {"status": "ok"}, ttl_seconds=1.0)
    assert memory_cache.get("test_key") == {"status": "ok"}

    # Invalidation check
    memory_cache.invalidate("test_key")
    assert memory_cache.get("test_key") is None

    # Expiration check
    memory_cache.set("short_key", 123, ttl_seconds=0.05)
    assert memory_cache.get("short_key") == 123
    time.sleep(0.06)
    assert memory_cache.get("short_key") is None





