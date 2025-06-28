export function getHTMLForSpinner(){
  const spinnerHMTL=
  ``
}
export function showSpinner() {
  document.getElementById('global-spinner')?.classList.remove('hide');
}

export function hideSpinner() {
  document.getElementById('global-spinner')?.classList.add('hide');
}