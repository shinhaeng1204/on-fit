export function handleMaxLength(
  e: React.ChangeEvent<HTMLInputElement>,
  max: number
) {
  if (e.target.value.length > max) {
    e.target.value = e.target.value.slice(0, max);
  }
}