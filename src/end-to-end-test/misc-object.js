test("change object name", () => {
  goTo("o1,ChangeMyName");
  clickAndType("ChangeMyName", "NewText");
  return assertFragment("o1,NewText");
});
