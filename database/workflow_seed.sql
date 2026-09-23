USE devcollab;

UPDATE evaluation_criteria SET active = TRUE, weight = 30, max_score = 100
WHERE criterion_name = 'FUNCTIONALITY';