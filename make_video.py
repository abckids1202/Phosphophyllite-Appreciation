import cv2, math, os
import numpy as np

ROOT = os.path.dirname(__file__)
FILES = [
    'phos-field.png','phos-sun.png','phos-anime.jpg','phos-portrait.png',
    'phos-sitting.png','phos-crescent.png','phos-water.png','phos-black.png','phos-hands.png'
]
W, H, FPS, SECONDS = 960, 540, 30, 2.25
frames_per_scene = int(FPS * SECONDS)
images = []
for name in FILES:
    image = cv2.imread(os.path.join(ROOT, 'assets', name))
    if image is None:
        raise SystemExit(f'Missing image: {name}')
    images.append(image)

def cover(image, zoom=1.0, dx=0, dy=0):
    ih, iw = image.shape[:2]
    scale = max(W / iw, H / ih) * zoom
    resized = cv2.resize(image, (round(iw * scale), round(ih * scale)), interpolation=cv2.INTER_LANCZOS4)
    rh, rw = resized.shape[:2]
    cx, cy = rw // 2 + int(dx), rh // 2 + int(dy)
    x1, y1 = max(0, cx - W // 2), max(0, cy - H // 2)
    crop = resized[y1:y1 + H, x1:x1 + W]
    return cv2.resize(crop, (W, H), interpolation=cv2.INTER_AREA)

writer = cv2.VideoWriter(os.path.join(ROOT, 'assets', 'phos-edit.mp4'), cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
webm_writer = cv2.VideoWriter(os.path.join(ROOT, 'assets', 'phos-edit.webm'), cv2.VideoWriter_fourcc(*'VP80'), FPS, (W, H))
if not writer.isOpened() or not webm_writer.isOpened():
    raise SystemExit('Could not open one of the video writers')
previous = None
for scene, image in enumerate(images):
    for frame in range(frames_per_scene):
        t = frame / max(1, frames_per_scene - 1)
        zoom = 1.02 + 0.07 * t
        dx = math.sin(t * math.pi * 2 + scene) * 16
        dy = math.cos(t * math.pi * 1.4 + scene) * 10
        shake = max(0, 1 - frame / 14) * 8
        dx += math.sin(frame * 2.9 + scene) * shake
        dy += math.cos(frame * 3.7 + scene) * shake
        current = cover(image, zoom, dx, dy)
        if previous is not None and frame < 12:
            mix = frame / 12
            current = cv2.addWeighted(previous, 1 - mix, current, mix, 0)
            flash = int(max(0, 1 - frame / 12) * 95)
            current = cv2.add(current, np.full_like(current, flash))
        writer.write(current)
        webm_writer.write(current)
    previous = current
writer.release()
webm_writer.release()
print('Wrote assets/phos-edit.mp4 and assets/phos-edit.webm')
