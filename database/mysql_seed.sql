USE devcollab;

INSERT INTO evaluation_criteria (criterion_name, description, weight, max_score, active)
VALUES
 ('FUNCTIONALITY', 'Deterministic test pass rate for the submitted software project.', 30, 100, TRUE),
 ('CODE QUALITY', 'Maintainability and clarity of the project.', 15, 100, FALSE),
 ('PERFORMANCE', 'Execution performance in a controlled environment.', 10, 100, FALSE),
 ('DATABASE DESIGN', 'Quality of database structure and relationships.', 10, 100, FALSE),
 ('DOCUMENTATION', 'Completeness and usefulness of documentation.', 10, 100, FALSE),
 ('INNOVATION', 'Originality and creativity of the solution.', 10, 100, FALSE),
 ('SECURITY', 'Security practices in the submitted project.', 5, 100, FALSE),
 ('UI/UX', 'Usability and interface quality.', 5, 100, FALSE),
 ('PRESENTATION', 'Clarity of project presentation.', 5, 100, FALSE)
ON DUPLICATE KEY UPDATE
 description = VALUES(description), weight = VALUES(weight), max_score = VALUES(max_score), active = VALUES(active);