const repositoryAPI = 'https://api.github.com/repos/ms0408choi/CAIS_NME_Project';
const repositoryCache = 'review-balance:github-push:v1';

function checkResponse(data) {
  const pushedAt = data?.pushed_at;
  if (typeof pushedAt !== 'string' || !Number.isFinite(Date.parse(pushedAt))) {
    return { ok: false, error: 'pushed_at must be a valid timestamp.' };
  }
  return { ok: true, data: { pushed_at: pushedAt } };
}

async function getData() {
  try {
    const response = await fetch(repositoryAPI, {
      method: 'GET',
      credentials: 'omit',
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return { ok: false, error: 'GitHub returned HTTP ' + response.status + '.' };
    return checkResponse(await response.json());
  } catch (error) {
    const message = error.name === 'TimeoutError' ? 'The request timed out.' : 'GitHub could not be reached or its response could not be read.';
    return { ok: false, error: message };
  }
}

function readSavedActivity() {
  try {
    const saved = JSON.parse(localStorage.getItem(repositoryCache));
    if (checkResponse(saved?.data).ok && Number.isFinite(saved.fetchedAt) &&
        Number.isFinite(new Date(saved.fetchedAt).getTime())) return saved;
  } catch {
    // The browser may block storage or the saved value may be invalid.
  }
  return null;
}

const activityStatus = document.getElementById('activity-status');
if (activityStatus) {
  const refreshActivity = document.getElementById('refresh-activity');
  const formatTime = value => new Date(value).toLocaleString();
  let lastGood = readSavedActivity();

  async function loadActivity() {
    refreshActivity.disabled = true;
    activityStatus.textContent = 'Loading…';
    try {
      const result = await getData();
      if (result.ok) {
        lastGood = { data: result.data, fetchedAt: Date.now() };
        try {
          localStorage.setItem(repositoryCache, JSON.stringify(lastGood));
        } catch {
          // Keep the current response available for this visit.
        }
        activityStatus.textContent = 'Last code push: ' + formatTime(lastGood.data.pushed_at);
      } else {
        const saved = lastGood
          ? ' Showing saved activity. Last code push: ' + formatTime(lastGood.data.pushed_at) +
            '. Last updated ' + formatTime(lastGood.fetchedAt) + '.'
          : '';
        activityStatus.textContent = 'Could not load GitHub activity. ' + result.error + saved;
      }
    } finally {
      refreshActivity.disabled = false;
    }
  }

  refreshActivity.addEventListener('click', loadActivity);
  loadActivity();
}
