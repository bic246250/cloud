# Source manifest: fetal-development

Guide: `src/pages/guides/fetal-development.astro` (slug `fetal-development`).

Format: `- <claim> - <URL> - fetched <date>`.

## Sources

- Conception usually happens about two weeks after the first day of the last period; pregnancy is counted 40 weeks from the last period - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- Embryonic period runs to eight weeks after fertilisation, so the switch to "fetus" falls at week 10 of pregnancy as normally counted; Mayo Clinic describes the baby as a fetus from week 11 of pregnancy (nine weeks after conception) - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- Sperm and egg unite in a fallopian tube to form a zygote, which travels to the uterus, becomes a blastocyst and implants - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- Pregnancy lasts about 40 weeks, or just over 9 months, measured from the last menstrual period; zygote implants in the uterine wall - https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo - fetched 2026-10-22
- At week 6 of pregnancy (four weeks after conception) the neural tube closes, the brain and spinal cord develop from it, and the heart and other organs start to form - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- At week 7 (five weeks after conception) the brain and face grow, the first part of the retinas forms, lower limb buds appear and the arm buds become paddles - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- At week 8 (six weeks after conception) fingers have begun to form, the ears and eyes become noticeable and the upper lip and nose have formed; the embryo is about half an inch (11 to 14 mm) crown to rump - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- By week 10 (eight weeks after conception) the fingers and toes have lost their webbing and grown longer - https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302 - fetched 2026-10-22
- Trimesters split as weeks 4 to 12, weeks 13 to 27 and weeks 28 to 41 - https://www.nhs.uk/pregnancy/week-by-week/ - fetched 2026-10-22
- At 20 weeks a woman may begin to feel movement; between 18 and 20 weeks an ultrasound is usually done to look for congenital anomalies - https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo - fetched 2026-10-22
- At 32 weeks the bones are soft and yet almost fully formed, and the eyes can open and close - https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo - fetched 2026-10-22
- Infants born before 37 weeks are preterm and face increased risk of developmental delays, vision and hearing problems and cerebral palsy; 39 or 40 weeks is full term, and delivery at or after 39 weeks gives the lungs, brain and liver time to fully develop - https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo - fetched 2026-10-22
- By week 36 the baby's lungs are probably mature enough to breathe outside the womb without help, and the baby is around 47.4 cm from head to heel - https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/3rd-trimester/week-36/ - fetched 2026-10-22

## Notes

- ACOG: the ACOG FAQ renders its answers inside collapsed accordions, so a plain text fetch returns only navigation chrome. It was verified during parent review by loading the page in a browser and expanding the accordions. ACOG states: "For 8 weeks after fertilization, it is called an embryo. From 9 weeks after fertilization until birth, it is called a fetus." The guide's week-11 statement is therefore correct (9 weeks after fertilization equals 11 weeks of pregnancy, since pregnancy is dated from the last menstrual period) and is now cited directly to the ACOG page.
- `https://www.acog.org/womens-health/faqs/stages-of-pregnancy` returned an HTTP error and was not used.
- Mayo Clinic "Fetal development: The 3rd trimester" candidates (`art-20045304`, `art-20047210`) returned 404, so the third-trimester content rests on the NHS week 36 page and NICHD. `https://www.nhs.uk/pregnancy/week-by-week/10-weeks/` and `/5-weeks/` also returned 404.
- Surfactant: the task asked for surfactant in the lung maturity section. No fetched source states a surfactant timeline, so surfactant is not mentioned in the guide, per the brief's rule to leave out unverifiable facts.
- Cardiac activity: no fetched source gives a single agreed week for when cardiac activity first becomes visible on a scan. The section states only the verified Mayo Clinic fact that heart formation starts at week 6 of pregnancy, and says plainly that no week is given here.
- Weight: the original sentence "the baby gains about half a pound per week in the final weeks" had no verifiable source among the fetched pages, so it was replaced with verified NHS trimester boundaries and NICHD term definitions. The existing bullet weights (2.5 lb, 4-6 lb, 6-7.5 lb) were carried over unchanged as existing content and are not re-verified here.
- `https://womenshealth.gov/pregnancy/youre-pregnant-now-what/stages-pregnancy` (Office on Women's Health) was fetched but is not on the brief's authority list (ACOG, NHS, NICHD, Mayo Clinic, NICE, WHO, SACN), so no claim is cited to it.
- Em dashes removed from the file, including the frontmatter description and the Related Tools bullets; the periviable range now reads "20 0/7 to 25 6/7 weeks".
