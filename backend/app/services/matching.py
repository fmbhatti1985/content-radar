from typing import Dict, Any

class MatchScorer:
    def __init__(self, settings: Any = None):
        # Default weights
        self.weights = {
            "visual": 0.40,
            "audio": 0.25,
            "transcript": 0.20,
            "caption": 0.10,
            "duration": 0.05
        }

    def score_match(self, source: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates similarity between source and candidate content.
        Uses SequenceMatcher for text and basic math for duration.
        """
        import difflib
        
        def text_similarity(a, b):
            if not a and not b:
                return 0.0
            a_str = str(a).lower() if a else ""
            b_str = str(b).lower() if b else ""
            return difflib.SequenceMatcher(None, a_str, b_str).ratio() * 100.0
            
        def duration_similarity(a, b):
            if not a or not b:
                return 0.0
            try:
                a_fl = float(a)
                b_fl = float(b)
                if a_fl == 0 and b_fl == 0:
                    return 0.0
                diff = abs(a_fl - b_fl)
                max_dur = max(a_fl, b_fl)
                return max(0.0, (1.0 - (diff / max_dur)) * 100.0)
            except:
                return 0.0
                
        # Calculate real scores based on text matching
        title_score = text_similarity(source.get("title"), candidate.get("title"))
        caption_score = text_similarity(source.get("caption"), candidate.get("caption"))
        duration_score = duration_similarity(source.get("duration_seconds"), candidate.get("duration_seconds"))
        
        # We don't have real visual/audio analysis in this demo, so we heavily weight title/caption
        # or just fallback them to the title score.
        visual_score = title_score  # Fallback
        audio_score = title_score   # Fallback
        transcript_score = title_score # Fallback
        
        overall = (
            visual_score * self.weights["visual"] +
            audio_score * self.weights["audio"] +
            transcript_score * self.weights["transcript"] +
            caption_score * self.weights["caption"] +
            duration_score * self.weights["duration"]
        )
        
        confidence = "low"
        if overall >= 90:
            confidence = "very_high"
        elif overall >= 80:
            confidence = "high"
        elif overall >= 65:
            confidence = "possible"
            
        return {
            "overall_score": round(overall, 2),
            "visual_score": round(visual_score, 2),
            "audio_score": round(audio_score, 2),
            "transcript_score": round(transcript_score, 2),
            "caption_score": round(caption_score, 2),
            "duration_score": round(duration_score, 2),
            "confidence": confidence
        }

    def calculate_gap_score(self, source: Dict[str, Any], match_scores: list[float]) -> Dict[str, Any]:
        """
        Estimates how interesting a cross-platform opportunity is.
        """
        views = source.get("view_count")
        if views is None:
            views = 0
        # Normalize views roughly (e.g. 10M is max)
        normalized_views = min(1.0, views / 10000000)
        
        # Gap ratio: 1.0 if no matches on any target platform, lower if matched
        # In this mock, if highest match is low, gap ratio is high
        highest_match = max(match_scores) if match_scores else 0.0
        gap_ratio = 1.0 - (highest_match / 100.0)
        
        # Simple heuristic
        gap_score = (normalized_views * 0.5 + gap_ratio * 0.5) * 100
        gap_score = min(100.0, max(0.0, gap_score))
        
        potential = "low"
        if gap_score >= 85:
            potential = "very_high"
        elif gap_score >= 70:
            potential = "high"
        elif gap_score >= 40:
            potential = "medium"
            
        return {
            "gap_score": round(gap_score, 2),
            "potential": potential
        }
