import os
import subprocess
import time
from playwright.sync_api import sync_playwright

FRAMES_DIR = "/Users/jacobkothapally/Downloads/1234FORGE/veritas-ai/video_frames"
AUDIO_DIR = "/Users/jacobkothapally/Downloads/1234FORGE/veritas-ai/video_audio"
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# Conversational, human, authentic narrative script
SCENES = [
    {
        "id": "scene_01_hero",
        "action": "load_hero",
        "voice": "Hey everyone. Welcome to Veritas Nexus. In deep-tech, billions of dollars are poured into companies based on impressive press releases and keynote slides. But while marketing teams can say whatever sounds exciting, patent attorneys cannot lie to the Patent Office without committing patent fraud, and nature never lies about the laws of physics. That is why we built Veritas Nexus for the SerpApi India Hackathon."
    },
    {
        "id": "scene_02_overview",
        "action": "view_quantumscape_overview",
        "voice": "Here is how it actually works. You take an entity like QuantumScape, which promises solid-state batteries that charge in 15 minutes with zero dendrites. Veritas Nexus immediately dispatches parallel queries across four specialized SerpApi engines: Google Patents, Google Scholar, Google News, and Technical Web."
    },
    {
        "id": "scene_03_contradictions",
        "action": "click_contradictions",
        "voice": "The agent reconciles public marketing against legal disclosures in our Contradiction Matrix. Notice this finding: while the company's PR claims zero degradation, their actual patent, US11652230B2, mandates a heavy 3.4 atmosphere mechanical clamp around the battery cell, or it fails. That mechanical clamp adds severe weight and thermal overhead that wipes out pack-level energy gains."
    },
    {
        "id": "scene_04_grill",
        "action": "click_grill",
        "voice": "To make this practical for real investors, we built Grill the Founder. It generates red-team interrogation questions grounded in exact patent claims. You can copy these directly into your partner meetings to cut through rehearsed founder pitches and target undisclosed pilot scrap rates."
    },
    {
        "id": "scene_05_collision",
        "action": "click_collision",
        "voice": "Next, the Prior-Art Collision Radar checks Freedom-to-Operate risks. Here, it detected Toyota's overlapping solid-state patent portfolio, flagging a 74 out of 100 litigation threat that could saddle the company with heavy royalty licensing fees."
    },
    {
        "id": "scene_06_dossier",
        "action": "click_risk_charts",
        "voice": "Finally, the agent calculates the capital at risk—flagging 1.85 billion dollars in downside exposure—and compiles everything into an institutional investor dossier you can download with one click. Veritas Nexus turns weeks of technical due diligence into instant engineering truth. Thanks for watching."
    }
]

def generate_voiceover():
    print("Generating natural human-style voiceover...")
    # 'Daniel' from Apple provides a very clear, calm British documentary narration tone
    # or 'Samantha' at natural human cadence (165 words per min)
    VOICE = "Daniel"
    for idx, scene in enumerate(SCENES):
        audio_file = os.path.join(AUDIO_DIR, f"{scene['id']}.aiff")
        wav_file = os.path.join(AUDIO_DIR, f"{scene['id']}.wav")
        
        # Natural conversational pace with say
        subprocess.run(["say", "-v", VOICE, "-r", "165", "-o", audio_file, scene["voice"]], check=True)
        subprocess.run(["ffmpeg", "-y", "-i", audio_file, wav_file], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        probe = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", wav_file
        ], capture_output=True, text=True)
        dur = float(probe.stdout.strip()) + 0.8
        scene["actual_duration"] = dur
        print(f"Scene {idx+1}: {dur:.1f}s audio generated.")

def capture_scenes():
    print("Capturing high-resolution browser UI walkthrough...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(2)

        # Scene 1: Hero view
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_01_hero.png"))

        # Scene 2: QuantumScape overview cards
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_02_overview.png"))

        # Scene 3: Click Contradictions
        page.locator("text=Contradictions").first.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_03_contradictions.png"))

        # Scene 4: Click Grill Founder
        page.locator("text=Grill Founder").first.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_04_grill.png"))

        # Scene 5: Click Prior-Art Radar
        page.locator("text=Prior-Art Radar").first.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_05_collision.png"))

        # Scene 6: Click Risk Charts
        page.locator("text=Risk Charts").first.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(FRAMES_DIR, "scene_06_dossier.png"))

        browser.close()
    print("UI walkthrough captured successfully!")

def assemble_video():
    print("Rendering high quality video with ffmpeg...")
    concat_txt = os.path.join(FRAMES_DIR, "concat.txt")
    audio_concat_txt = os.path.join(AUDIO_DIR, "audio_concat.txt")

    with open(concat_txt, "w") as f_video, open(audio_concat_txt, "w") as f_audio:
        for scene in SCENES:
            img = os.path.join(FRAMES_DIR, f"{scene['id']}.png")
            dur = scene.get("actual_duration", 10.0)
            wav = os.path.join(AUDIO_DIR, f"{scene['id']}.wav")
            
            f_video.write(f"file '{img}'\n")
            f_video.write(f"duration {dur:.2f}\n")
            f_audio.write(f"file '{wav}'\n")
        # Repeat last frame for ffmpeg concat
        last_img = os.path.join(FRAMES_DIR, f"{SCENES[-1]['id']}.png")
        f_video.write(f"file '{last_img}'\n")

    # Combine all speech segments
    full_audio = os.path.join(AUDIO_DIR, "full_audio.wav")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", audio_concat_txt, "-c", "copy", full_audio
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Encode Final High-Definition MP4 Video
    output_mp4 = "/Users/jacobkothapally/Downloads/1234FORGE/veritas-ai/VERITAS_NEXUS_DEMO.mp4"
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-i", full_audio,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_mp4
    ], check=True)

    print(f"\n✨ FINAL PROFESSIONAL DEMO VIDEO READY:\n{output_mp4}")

if __name__ == "__main__":
    generate_voiceover()
    capture_scenes()
    assemble_video()
