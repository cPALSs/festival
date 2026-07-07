"""Festival policy preference scoring (cultural anchor, local business)."""

from __future__ import annotations

from typing import Any

ELK_GROVE_ZIP_PREFIXES = ("95624", "95757", "95758")


def is_elk_grove_based(applicant: dict[str, Any]) -> bool:
    """True when the vendor self-reports as part of the Elk Grove business community.

    Primary source: Eventeny yes/no (``elk_grove_based``). Business city/ZIP are a
    secondary hint for brick-and-mortar when the self-report field is blank — not
    reliable for food trucks (registration address may be the owner's home).
    """
    flagged = applicant.get("elk_grove_based")
    if flagged is True:
        return True
    if flagged is False:
        return False
    city = (applicant.get("business_city") or applicant.get("city") or "").lower()
    if "elk grove" in city:
        return True
    zip_code = str(applicant.get("business_zip") or applicant.get("zip") or "").strip()[:5]
    return any(zip_code.startswith(prefix) for prefix in ELK_GROVE_ZIP_PREFIXES)


def policy_preference_score(applicant: dict[str, Any], config: dict[str, Any] | None = None) -> float:
    """0.5 base; +0.5 Vietnamese anchor; +0.25 Elk Grove local (when enabled); cap 1.0."""
    config = config or {}
    policy = config.get("policy") or {}
    score = 0.5
    if applicant.get("vietnamese_anchor"):
        score += 0.5
    if policy.get("elk_grove_local_bonus", True) and is_elk_grove_based(applicant):
        score += 0.25
    return min(score, 1.0)


def vendor_business_residency_summary(applicants: list[dict[str, Any]]) -> dict[str, int]:
    """Elk Grove vs. non–Elk Grove vendor counts for post-event City reports.

    Uses ``elk_grove_based`` self-report when set; city/ZIP inference only when
    unanswered. Treat as community affiliation, not verified residency.
    """
    counts = {"elk_grove": 0, "non_elk_grove": 0, "unknown": 0, "total": 0}
    for applicant in applicants:
        counts["total"] += 1
        flagged = applicant.get("elk_grove_based")
        if flagged is True or (flagged is not False and is_elk_grove_based(applicant)):
            counts["elk_grove"] += 1
        elif flagged is False:
            counts["non_elk_grove"] += 1
        else:
            counts["unknown"] += 1
    return counts
