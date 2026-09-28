# Иконки приложения: восьмиконечный православный крест цвета --gold (тёмная тема) на #10151f.
# Координаты — в долях стороны; крест вписан в безопасную зону maskable-иконки (круг радиусом 0.4).
import math
import sys
from PIL import Image, ImageDraw

BG = (16, 21, 31)
GOLD = (216, 174, 87)
T = 0.062  # толщина перекладин

# Отрезки: (x1, y1, x2, y2, толщина). Нижняя перекладина — левый для смотрящего конец выше.
BARS = [
    (0.5, 0.17, 0.5, 0.83, T),          # столп
    (0.38, 0.265, 0.62, 0.265, T),       # титло
    (0.22, 0.385, 0.78, 0.385, T),       # главная перекладина
    (0.35, 0.625, 0.65, 0.685, T),       # подножие: правый от Распятого (левый для смотрящего) конец выше
]


def bar_polygon(x1, y1, x2, y2, t, s):
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    nx, ny = -dy / n * t / 2, dx / n * t / 2
    return [((x1 + nx) * s, (y1 + ny) * s), ((x2 + nx) * s, (y2 + ny) * s),
            ((x2 - nx) * s, (y2 - ny) * s), ((x1 - nx) * s, (y1 - ny) * s)]


def icon(size):
    big = size * 4  # рисуем крупнее и уменьшаем — сглаженные края
    im = Image.new('RGB', (big, big), BG)
    d = ImageDraw.Draw(im)
    for b in BARS:
        d.polygon(bar_polygon(*b, big), fill=GOLD)
    return im.resize((size, size), Image.LANCZOS)


# Запуск из корня репозитория: python3 icons/make-icons.py icons
out = sys.argv[1]
for name, size in [('icon-192', 192), ('icon-512', 512), ('apple-touch-icon', 180)]:
    icon(size).save(f'{out}/{name}.png', optimize=True)
print('ok')
