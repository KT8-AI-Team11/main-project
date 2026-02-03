INSERT INTO spring_db.company (company_name, domain)
VALUES ('에이블스쿨', 'aivle.kt.co')
ON DUPLICATE KEY UPDATE
  company_name = company_name;