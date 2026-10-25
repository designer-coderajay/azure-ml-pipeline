from xh import *
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import os
F = "caveat-latin-600-normal.woff2"

# 1. clean and split
c = Canvas(31, F)
c.rect(120, 330, 380, 70, fill="#fff")
for i in range(9):
    c.line([(150 + i * 40, 345), (150 + i * 40, 385)], BLACK, 2)
c.text(310, 300, "raw CSV", BLACK, 44, "middle")
c.xiaohei(640, 560, 1.0, look=-.8, hands=[(540, 380), None])
c.line([(520, 330), (520, 400)], RED, 4, dash="10 8")
c.rect(700, 250, 400, 100, fill="#fff")
for i in range(8):
    c.line([(730 + i * 44, 265), (730 + i * 44, 335)], BLACK, 2)
c.rect(700, 430, 100, 100, fill="#fff", color=ORANGE)
for i in range(2):
    c.line([(730 + i * 44, 445), (730 + i * 44, 515)], ORANGE, 2)
c.text(900, 400, "80% to train", BLACK, 42, "middle")
c.text(930, 575, "20% held back", RED, 44, "middle")
c.text(930, 620, "never used for training", BLUE, 34, "middle")
c.save("07-clean-split.svg")

# 2. train and score
c = Canvas(32, F)
for i in range(7):
    x = 180 + i * 62
    h = 70 + (i * 37) % 40
    c.line([(x, 520), (x, 520 - h)], BLACK, 4)
    c.circle(x, 520 - h - 22, 24, BLACK, "#fff", 3)
c.text(320, 600, "100 trees, depth up to 10", BLACK, 40, "middle")
c.xiaohei(760, 560, 1.0, look=-.8, hands=[(640, 470), None])
c.arrow([(850, 420), (980, 380)])
c.rect(990, 280, 190, 190, fill="#fff", rot=3)
for i in range(4):
    c.line([(1015, 320 + i * 38), (1150, 322 + i * 38)], BLACK, 2.6)
c.text(1085, 195, "scored on the\nheld-back 20%", BLUE, 38, "middle")
c.text(1085, 540, "metrics.json", RED, 44, "middle")
c.save("08-train-score.svg")

# 3. deploy and answer
c = Canvas(33, F)
c.rect(540, 300, 300, 220, fill="#fff")
c.rect(580, 340, 220, 36, fill="#fff"); c.rect(580, 440, 220, 36, fill="#fff")
c.text(690, 275, "managed endpoint", BLACK, 40, "middle")
c.text(690, 470, "score.py", BLACK, 32, "middle")
c.xiaohei(930, 520, 1.0, look=-.8, hands=[(850, 400), None])
c.rect(190, 330, 220, 90, fill="#fff", rot=-3)
c.text(300, 385, "{ JSON }", BLACK, 44, "middle")
c.arrow([(420, 380), (570, 355)])
c.rect(160, 520, 250, 80, fill="#fff", rot=2)
c.text(285, 570, "prediction + probability", BLACK, 30, "middle")
c.arrow([(540, 470), (430, 540)])
c.text(300, 250, "init() once,\nrun() on every request", BLUE, 38, "middle")
c.text(1040, 660, "endpoints bill 24/7:\ndelete when done", RED, 42, "middle")
c.save("09-deploy-answer.svg")
