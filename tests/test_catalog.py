import pytest

from dojo import catalog

DDL = """
CREATE TABLE gadgets (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  price      numeric(10,2) NOT NULL CHECK (price >= 0),
  serial     text UNIQUE
);
CREATE TABLE gadget_parts (
  id        int PRIMARY KEY,
  gadget_id int NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  label     text
);
CREATE VIEW pricey_gadgets AS SELECT * FROM gadgets WHERE price > 100;
CREATE INDEX gadget_parts_gadget_idx ON gadget_parts (gadget_id, label);
"""


@pytest.fixture()
def schema(scratch_db):
    scratch_db.execute(DDL)
    scratch_db.commit()
    return scratch_db


def test_assert_table_pass(schema):
    catalog.assert_table(schema, "gadgets", {"id": "int", "price": "numeric", "name": "text"})


def test_assert_table_missing(schema):
    with pytest.raises(AssertionError) as e:
        catalog.assert_table(schema, "widgets")
    assert "MISSING TABLE" in str(e.value)


def test_assert_table_wrong_type(schema):
    with pytest.raises(AssertionError) as e:
        catalog.assert_table(schema, "gadgets", {"name": "numeric"})
    msg = str(e.value)
    assert "WRONG TYPE" in msg and "text" in msg


def test_assert_table_missing_column(schema):
    with pytest.raises(AssertionError) as e:
        catalog.assert_table(schema, "gadgets", {"weight": "numeric"})
    assert "MISSING COLUMN" in str(e.value)


def test_not_null(schema):
    catalog.assert_not_null(schema, "gadgets", "name")
    with pytest.raises(AssertionError) as e:
        catalog.assert_not_null(schema, "gadget_parts", "label")
    assert "NULLABLE" in str(e.value)


def test_pk(schema):
    catalog.assert_pk(schema, "gadgets", ["id"])
    with pytest.raises(AssertionError):
        catalog.assert_pk(schema, "gadgets", ["serial"])


def test_unique(schema):
    catalog.assert_unique(schema, "gadgets", ["serial"])
    with pytest.raises(AssertionError) as e:
        catalog.assert_unique(schema, "gadgets", ["name"])
    assert "MISSING UNIQUE" in str(e.value)


def test_check(schema):
    catalog.assert_check(schema, "gadgets", "price")
    with pytest.raises(AssertionError) as e:
        catalog.assert_check(schema, "gadgets", "weight")
    assert "MISSING CHECK" in str(e.value)


def test_fk(schema):
    catalog.assert_fk(schema, "gadget_parts", ["gadget_id"], "gadgets", on_delete="CASCADE")
    with pytest.raises(AssertionError) as e:
        catalog.assert_fk(schema, "gadget_parts", ["gadget_id"], "gadgets", on_delete="SET NULL")
    assert "WRONG ON DELETE" in str(e.value)
    with pytest.raises(AssertionError) as e:
        catalog.assert_fk(schema, "gadgets", ["id"], "gadget_parts")
    assert "MISSING FOREIGN KEY" in str(e.value)


def test_view(schema):
    catalog.assert_view(schema, "pricey_gadgets")
    with pytest.raises(AssertionError) as e:
        catalog.assert_view(schema, "cheap_gadgets")
    assert "MISSING VIEW" in str(e.value)


def test_index(schema):
    catalog.assert_index(schema, "gadget_parts", ["gadget_id"])
    catalog.assert_index(schema, "gadget_parts", ["gadget_id", "label"])
    with pytest.raises(AssertionError) as e:
        catalog.assert_index(schema, "gadget_parts", ["label"])
    assert "LEADING" in str(e.value).upper()


def test_rejects_and_accepts(schema):
    catalog.rejects(schema, "INSERT INTO gadgets (id, name, price) VALUES (1, 'g', -5)",
                    why="negative price")
    catalog.accepts(schema, "INSERT INTO gadgets (id, name, price) VALUES (1, 'g', 5)")
    # probes must leave no state behind
    assert schema.execute("SELECT count(*) FROM gadgets").fetchone()[0] == 0
    with pytest.raises(AssertionError) as e:
        catalog.rejects(schema, "INSERT INTO gadgets (id, name, price) VALUES (2, 'ok', 5)")
    assert "DID NOT BITE" in str(e.value)
    with pytest.raises(AssertionError) as e:
        catalog.accepts(schema, "INSERT INTO gadgets (id, name, price) VALUES (3, 'x', -1)")
    assert "TOO STRICT" in str(e.value)
