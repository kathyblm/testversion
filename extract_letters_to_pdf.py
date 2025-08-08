import os
from typing import List, Tuple
import numpy as np
from PIL import Image

A4_PX_300DPI = (2480, 3508)  # width, height at 300 DPI
MARGIN_PX = 200
MIN_GAP_PX = 3
MIN_COMPONENT_AREA = 50
MIN_LETTER_WIDTH = 8


def load_image_grayscale(path: str) -> np.ndarray:
    image = Image.open(path).convert("L")
    return np.array(image)


def binarize(image_gray: np.ndarray) -> np.ndarray:
    # Otsu-like threshold using numpy (simple)
    hist, _ = np.histogram(image_gray, bins=256, range=(0, 255))
    total = image_gray.size
    sum_total = np.dot(np.arange(256), hist)
    sum_b, w_b, var_max, threshold = 0.0, 0.0, 0.0, 0
    for t in range(256):
        w_b += hist[t]
        if w_b == 0:
            continue
        w_f = total - w_b
        if w_f == 0:
            break
        sum_b += t * hist[t]
        m_b = sum_b / w_b
        m_f = (sum_total - sum_b) / w_f
        var_between = w_b * w_f * (m_b - m_f) ** 2
        if var_between > var_max:
            var_max = var_between
            threshold = t
    binary = (image_gray < threshold).astype(np.uint8)  # 1 for ink (dark)
    return binary


def find_connected_components(binary: np.ndarray) -> List[Tuple[int, int, int, int]]:
    # Simple connected-component labeling using 4-connectivity
    h, w = binary.shape
    visited = np.zeros_like(binary, dtype=bool)
    components: List[Tuple[int, int, int, int]] = []

    def neighbors(y: int, x: int):
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                yield ny, nx

    for y in range(h):
        for x in range(w):
            if binary[y, x] and not visited[y, x]:
                stack = [(y, x)]
                visited[y, x] = True
                min_y, min_x, max_y, max_x = y, x, y, x
                area = 0
                while stack:
                    cy, cx = stack.pop()
                    area += 1
                    if cy < min_y: min_y = cy
                    if cx < min_x: min_x = cx
                    if cy > max_y: max_y = cy
                    if cx > max_x: max_x = cx
                    for ny, nx in neighbors(cy, cx):
                        if binary[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            stack.append((ny, nx))
                if area >= MIN_COMPONENT_AREA:
                    components.append((min_x, min_y, max_x + 1, max_y + 1))  # (x1,y1,x2,y2)

    # Merge very close components horizontally to handle letters split by gaps
    components.sort(key=lambda b: (b[1], b[0]))
    merged: List[Tuple[int, int, int, int]] = []
    for box in components:
        if not merged:
            merged.append(box)
            continue
        last = merged[-1]
        lx1, ly1, lx2, ly2 = last
        x1, y1, x2, y2 = box
        overlaps_vertically = not (y2 < ly1 or y1 > ly2)
        close_horizontally = x1 - lx2 <= MIN_GAP_PX
        if overlaps_vertically and close_horizontally:
            nx1, ny1 = min(lx1, x1), min(ly1, y1)
            nx2, ny2 = max(lx2, x2), max(ly2, y2)
            merged[-1] = (nx1, ny1, nx2, ny2)
        else:
            merged.append(box)

    # Sort left-to-right
    merged.sort(key=lambda b: (b[1] // 100, b[0]))
    return merged


def compute_vertical_projection(binary: np.ndarray, bbox: Tuple[int, int, int, int]):
    x1, y1, x2, y2 = bbox
    roi = binary[y1:y2, x1:x2]
    proj = roi.sum(axis=0) if roi.size else np.array([])
    return roi, proj


def choose_cuts_for_n_segments(proj: np.ndarray, n_segments: int, min_width: int) -> List[int]:
    # Smooth the projection
    if proj.size == 0:
        return [0]
    window = max(5, min(51, proj.shape[0] // 40 * 2 + 1))
    kernel = np.ones(window, dtype=float) / window
    proj_s = np.convolve(proj, kernel, mode='same')

    # Candidate cut indices at local minima
    minima = []
    for i in range(1, len(proj_s) - 1):
        if proj_s[i] <= proj_s[i - 1] and proj_s[i] <= proj_s[i + 1]:
            minima.append(i)
    # If not enough minima, take globally lowest columns
    if len(minima) < n_segments - 1:
        order = np.argsort(proj_s)
        for idx in order:
            if idx not in minima:
                minima.append(idx)
            if len(minima) >= n_segments - 1:
                break

    # Sort minima by x
    minima = sorted(minima)

    # Enforce boundaries and min width by greedy selection
    cuts = [0]
    last = 0
    for m in minima:
        if m - last >= min_width:
            cuts.append(m)
            last = m
        if len(cuts) == n_segments:
            break
    # Ensure final boundary
    cuts.append(len(proj))

    # If we still have too few segments, try evenly spaced fallback
    if len(cuts) - 1 < n_segments:
        cuts = [0]
        step = len(proj) // n_segments if n_segments else len(proj)
        for k in range(1, n_segments):
            cuts.append(min(len(proj) - min_width, k * step))
        cuts.append(len(proj))

    # Deduplicate and sort
    cuts = sorted(set(int(c) for c in cuts))

    # Remove too-narrow segments
    filtered = [cuts[0]]
    for c in cuts[1:]:
        if c - filtered[-1] >= min_width:
            filtered.append(c)
    if filtered[-1] != len(proj):
        filtered[-1] = len(proj)
    return filtered


def split_into_n_by_projection(binary: np.ndarray, bbox: Tuple[int, int, int, int], n_letters: int) -> List[Tuple[int, int, int, int]]:
    x1, y1, x2, y2 = bbox
    roi, proj = compute_vertical_projection(binary, bbox)
    if roi.size == 0:
        return []

    cuts = choose_cuts_for_n_segments(proj, n_letters, min_width=max(MIN_LETTER_WIDTH, (x2 - x1) // (n_letters * 4)))

    boxes: List[Tuple[int, int, int, int]] = []
    for i in range(len(cuts) - 1):
        cx1 = cuts[i]
        cx2 = cuts[i + 1]
        if cx2 - cx1 < MIN_LETTER_WIDTH:
            continue
        slice_roi = roi[:, cx1:cx2]
        row_proj = slice_roi.sum(axis=1)
        rows = np.where(row_proj > 0)[0]
        if rows.size == 0:
            continue
        ry1, ry2 = rows[0], rows[-1] + 1
        boxes.append((x1 + cx1, y1 + ry1, x1 + cx2, y1 + ry2))

    if len(boxes) != n_letters:
        # Fallback to original bbox if segmentation failed
        return [bbox]

    return boxes


def save_letter_pdf(letter_img: Image.Image, out_path: str):
    # Fit letter within A4 with margins, preserving aspect ratio
    a4_w, a4_h = A4_PX_300DPI
    canvas = Image.new("L", (a4_w, a4_h), color=255)

    # Add generous margins
    max_w = a4_w - 2 * MARGIN_PX
    max_h = a4_h - 2 * MARGIN_PX

    lw, lh = letter_img.size
    scale = min(max_w / lw, max_h / lh)
    new_size = (max(1, int(lw * scale)), max(1, int(lh * scale)))
    letter_resized = letter_img.resize(new_size, Image.LANCZOS)

    paste_x = (a4_w - letter_resized.width) // 2
    paste_y = (a4_h - letter_resized.height) // 2

    canvas.paste(letter_resized, (paste_x, paste_y))
    canvas.convert("RGB").save(out_path, "PDF", resolution=300.0)


def process_image(input_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    gray = load_image_grayscale(input_path)
    binary = binarize(gray)

    boxes = find_connected_components(binary)

    # If only one component (likely the whole word), split into exactly 3 letters (A,R,E)
    if len(boxes) == 1:
        boxes = split_into_n_by_projection(binary, boxes[0], n_letters=3)

    if not boxes:
        raise RuntimeError("Keine Buchstaben gefunden – prüfen Sie das Bild.")

    image_gray_pil = Image.fromarray(gray)

    # Sort left-to-right
    boxes.sort(key=lambda b: b[0])

    # If exactly 3, map to A,R,E
    names = ["A", "R", "E"] if len(boxes) == 3 else [f"letter_{i+1:02d}" for i in range(len(boxes))]

    for idx, (x1, y1, x2, y2) in enumerate(boxes):
        crop = image_gray_pil.crop((x1, y1, x2, y2))
        crop_np = np.array(crop)
        crop_np = np.clip(crop_np, 0, 255).astype(np.uint8)
        # Ensure black on white
        if crop_np.mean() > 128 and (255 - crop_np).mean() < crop_np.mean():
            crop_np = 255 - crop_np
        letter = Image.fromarray(crop_np).convert("L")

        name = names[idx]
        out_pdf = os.path.join(output_dir, f"{name}.pdf")
        save_letter_pdf(letter, out_pdf)

    print(f"Gespeichert: {len(boxes)} PDFs in {output_dir}")


if __name__ == "__main__":
    INPUT = "/workspace/Bild1 (1).png"
    OUTPUT = "/workspace/output_letters"
    process_image(INPUT, OUTPUT)