// Gate for react/d08_forms_controlled. Quoted verbatim in README.md.
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { NicknameField } from "./ex1/solution";
import { ShippingChoice } from "./ex2/solution";
import { FeedbackForm } from "./ex3/solution";
import { AddressBlock } from "./ex4/solution";
import { QuantityBox } from "./ex5/solution";
import { CountryCity } from "./ex6/solution";
import { TagsInput } from "./ex7/solution";
import { CurrencyField } from "./ex8/solution";

describe("d08_forms_controlled", () => {
  test("ex1 - NicknameField shows what it accepted and refuses the rest", async () => {
    const user = userEvent.setup();
    render(<NicknameField maxLength={5} />);

    const box = screen.getByLabelText("Nickname");
    await user.type(box, "ada");

    expect(
      box,
      "the box shows the state, and the state is what you typed - if this is " +
        "empty the input is uncontrolled and value is missing (README ex1)",
    ).toHaveValue("ada");
    expect(
      screen.getByRole("status"),
      "the counter reads length/limit, so three characters of five is 3/5",
    ).toHaveTextContent("3/5");

    await user.type(box, " lo");
    expect(
      box,
      "a space is not allowed, so that keystroke changes nothing at all while " +
        "the letters around it still land: adalo",
    ).toHaveValue("adalo");
    expect(screen.getByRole("status")).toHaveTextContent("5/5");

    await user.type(box, "x");
    expect(
      box,
      "the sixth character has to be refused by the change handler. Ignoring a " +
        "change means not calling the setter - React then re-renders the input " +
        "back to the state it already had",
    ).toHaveValue("adalo");
    expect(screen.getByRole("status")).toHaveTextContent("5/5");

    await user.clear(box);
    expect(
      screen.getByRole("status"),
      "an empty box is a legal value, and it counts as 0/5",
    ).toHaveTextContent("0/5");
  }, 30000);

  test("ex2 - ShippingChoice is one group in which exactly one option can be chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ShippingChoice onChange={onChange} />);

    const group = screen.queryByRole("radiogroup", { name: "Shipping" });
    expect(
      group,
      "the three radios belong to one another, and the element that says so " +
        "carries role=radiogroup plus a name of Shipping (README ex2)",
    ).not.toBeNull();
    expect(
      within(group!).queryAllByRole("radio").length,
      "three options: Standard, Express and Overnight",
    ).toBe(3);
    expect(
      screen.queryByRole("radio", { checked: true }),
      "nothing is chosen until the user chooses - do not default the state to " +
        "the first option",
    ).toBeNull();

    await user.click(screen.getByRole("radio", { name: "Express" }));
    expect(
      screen.getByRole("radio", { name: "Express" }),
      "clicking a radio has to check it, which means the checked prop is read " +
        "from state",
    ).toBeChecked();
    expect(
      screen.getByRole("status"),
      "and the estimate follows the choice: Arrives in 2 days",
    ).toHaveTextContent("Arrives in 2 days");
    expect(onChange, "onChange reports the value, not the label").toHaveBeenLastCalledWith(
      "express",
    );

    await user.click(screen.getByRole("radio", { name: "Standard" }));
    expect(
      screen.getByRole("radio", { name: "Express" }),
      "choosing another option must clear the first one. Radios that share one " +
        "name attribute are mutually exclusive - without it you have built " +
        "three checkboxes",
    ).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("Arrives in 5 days");
    expect(onChange).toHaveBeenLastCalledWith("standard");
  }, 30000);

  test("ex3 - FeedbackForm hands over both fields and stops the browser submitting too", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FeedbackForm onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText("Category"), "idea");
    await user.type(screen.getByLabelText("Message"), "The dark theme is too dark");

    const form = screen.queryByRole("form", { name: "Feedback" });
    expect(
      form,
      "a form element only has the form role once it has an accessible name, " +
        "so this one needs aria-label=Feedback (README ex3)",
    ).not.toBeNull();

    const wentThroughToTheBrowser = fireEvent.submit(form!);
    expect(
      wentThroughToTheBrowser,
      "the submit handler must call event.preventDefault(). Without it the " +
        "browser posts the form and reloads the page, which in a single-page " +
        "app throws away everything",
    ).toBe(false);
    expect(onSubmit, "one submit, one call").toHaveBeenCalledTimes(1);
    expect(
      onSubmit,
      "and it hands over the two controlled values as one object",
    ).toHaveBeenLastCalledWith({ category: "idea", message: "The dark theme is too dark" });

    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(
      onSubmit,
      "the button has to submit the form it sits in - that is what type=submit " +
        "is for, and it is what makes the Enter key work as well",
    ).toHaveBeenCalledTimes(2);
  }, 30000);

  test("ex4 - AddressBlock keeps three fields in one object and one handler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressBlock onChange={onChange} />);

    await user.type(screen.getByLabelText("Street"), "12 Bell Lane");
    await user.type(screen.getByLabelText("City"), "Ballarat");
    await user.type(screen.getByLabelText("Postcode"), "3350");

    expect(
      screen.getByLabelText("Street"),
      "the street emptied out when a later field was typed into. Replacing the " +
        "state object rather than spreading it deletes every key you did not " +
        "mention (README ex4)",
    ).toHaveValue("12 Bell Lane");
    expect(screen.getByLabelText("City"), "the city keeps its own value").toHaveValue("Ballarat");
    expect(screen.getByLabelText("Postcode")).toHaveValue("3350");
    expect(
      onChange,
      "the parent is told the whole address after every keystroke, not just the " +
        "field that changed",
    ).toHaveBeenLastCalledWith({ street: "12 Bell Lane", city: "Ballarat", postcode: "3350" });

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.getByLabelText("Street"),
      "one object is one thing to reset - Clear puts back the empty address",
    ).toHaveValue("");
    expect(screen.getByLabelText("City")).toHaveValue("");
    expect(screen.getByLabelText("Postcode")).toHaveValue("");
    expect(onChange, "and the parent hears about that too").toHaveBeenLastCalledWith({
      street: "",
      city: "",
      postcode: "",
    });
  }, 30000);

  test("ex5 - QuantityBox lets the box be empty and cleans up on the way out", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();
    render(<QuantityBox onQuantityChange={onQuantityChange} />);

    const box = screen.getByLabelText("Quantity");
    await user.type(box, "7");
    expect(
      box,
      "the box holds the text the user typed. Storing a number instead means " +
        "the empty box becomes 0 and NaN is one keystroke away (README ex5)",
    ).toHaveValue("7");
    expect(onQuantityChange, "and the parent gets the number 7").toHaveBeenLastCalledWith(7);
    expect(onQuantityChange).toHaveBeenCalledTimes(1);

    await user.type(box, "x");
    expect(box, "a letter is not a quantity, so that change is ignored").toHaveValue("7");
    expect(
      onQuantityChange,
      "an ignored keystroke is not a change, so nobody is told about it",
    ).toHaveBeenCalledTimes(1);

    await user.clear(box);
    expect(
      box,
      "the user must be allowed to empty the box on the way to typing another " +
        "number - clamping while they type fights them",
    ).toHaveValue("");
    expect(
      onQuantityChange,
      "an empty box has no quantity, and that is null rather than 0",
    ).toHaveBeenLastCalledWith(null);

    await user.tab();
    expect(
      box,
      "leaving an empty box is where the tidying happens: the lowest legal " +
        "quantity is 1",
    ).toHaveValue("1");
    expect(onQuantityChange).toHaveBeenLastCalledWith(1);

    await user.clear(box);
    await user.type(box, "250");
    expect(box, "250 is still being typed, so it stands").toHaveValue("250");

    await user.tab();
    expect(box, "and on the way out it is clamped to the top of the range").toHaveValue("99");
    expect(onQuantityChange).toHaveBeenLastCalledWith(99);
  }, 30000);

  test("ex6 - CountryCity rebuilds the second select from the first", async () => {
    const user = userEvent.setup();
    render(
      <CountryCity
        catalogue={{
          Australia: ["Ballarat", "Geelong"],
          Japan: ["Kyoto", "Osaka"],
        }}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(
      continueButton,
      "nothing has been chosen, so there is nothing to continue to (README ex6)",
    ).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Country"), "Australia");
    expect(
      within(screen.getByLabelText("City")).queryAllByRole("option").map((o) => o.textContent),
      "the city list is derived from the chosen country during render - it is " +
        "not a second piece of state to keep in step",
    ).toEqual(["Choose a city", "Ballarat", "Geelong"]);

    await user.selectOptions(screen.getByLabelText("City"), "Geelong");
    expect(
      screen.getByRole("button", { name: "Continue" }),
      "a country and a city is a complete answer, so the button unlocks",
    ).toBeEnabled();

    await user.selectOptions(screen.getByLabelText("Country"), "Japan");
    expect(
      screen.getByLabelText("City"),
      "Geelong is not in Japan. Changing the country has to clear the city, or " +
        "the form submits a pair that never existed",
    ).toHaveValue("");
    expect(
      within(screen.getByLabelText("City")).queryAllByRole("option").map((o) => o.textContent),
      "and the options follow the new country",
    ).toEqual(["Choose a city", "Kyoto", "Osaka"]);
    expect(
      screen.getByRole("button", { name: "Continue" }),
      "with the city cleared the answer is incomplete again",
    ).toBeDisabled();
  }, 30000);

  test("ex7 - TagsInput turns text into chips and refuses the same one twice", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagsInput onChange={onChange} />);

    const box = screen.getByLabelText("Tags");
    await user.type(box, "react{Enter}");

    expect(
      screen.queryAllByRole("listitem").length,
      "Enter turns the draft into a chip - and preventDefault stops that same " +
        "Enter submitting a surrounding form (README ex7)",
    ).toBe(1);
    expect(box, "the box empties, ready for the next one").toHaveValue("");
    expect(onChange, "and the parent gets the whole list").toHaveBeenLastCalledWith(["react"]);

    await user.type(box, "redux{Enter}");
    expect(screen.queryAllByRole("listitem").length, "two tags now").toBe(2);
    expect(onChange).toHaveBeenLastCalledWith(["react", "redux"]);

    await user.type(box, "react{Enter}");
    expect(
      screen.queryAllByRole("listitem").length,
      "a duplicate must not be added. Checking the array you already have is " +
        "the whole of it",
    ).toBe(2);
    expect(
      screen.getByRole("status"),
      "and the user is told why nothing happened: react is already added",
    ).toHaveTextContent("react is already added");
    expect(box, "the rejected text stays in the box so it can be edited").toHaveValue("react");
    expect(onChange, "a rejected tag is not a change").toHaveBeenCalledTimes(2);

    await user.clear(box);
    await user.type(box, "{Backspace}");
    expect(
      screen.queryByRole("button", { name: "Remove redux" }),
      "Backspace in an empty box removes the last chip - only when the box is " +
        "empty, or you would delete a chip while editing a word",
    ).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(["react"]);

    await user.click(screen.getByRole("button", { name: "Remove react" }));
    expect(
      screen.queryAllByRole("listitem").length,
      "every chip owns a Remove button named after the tag it removes",
    ).toBe(0);
    expect(onChange).toHaveBeenLastCalledWith([]);
  }, 30000);

  test("ex8 - CurrencyField shows a grouped number and reports a plain one", () => {
    const onValueChange = vi.fn();
    render(<CurrencyField onValueChange={onValueChange} />);

    const box = screen.getByLabelText("Amount");

    fireEvent.change(box, { target: { value: "1234567" } });
    expect(
      box,
      "the box shows the formatted value, because a controlled input shows " +
        "whatever the state says: 1,234,567 (README ex8)",
    ).toHaveValue("1,234,567");
    expect(
      onValueChange,
      "the parent gets a number it can do arithmetic with, not the pretty string",
    ).toHaveBeenLastCalledWith(1234567);

    fireEvent.change(box, { target: { value: "12ab34" } });
    expect(
      box,
      "everything that is not a digit is dropped on the way in, so 12ab34 " +
        "becomes 1,234 rather than NaN",
    ).toHaveValue("1,234");
    expect(onValueChange).toHaveBeenLastCalledWith(1234);

    fireEvent.change(box, { target: { value: "" } });
    expect(box, "the box can be emptied").toHaveValue("");
    expect(
      onValueChange,
      "an empty box means no amount, which is null - reporting 0 would be a " +
        "price the user never typed",
    ).toHaveBeenLastCalledWith(null);

    fireEvent.change(box, { target: { value: "0" } });
    expect(box, "zero is a real amount and stays visible").toHaveValue("0");
    expect(
      onValueChange,
      "and zero is reported as the number 0 - the difference between 0 and null " +
        "is exactly the bug this exercise is about",
    ).toHaveBeenLastCalledWith(0);
  });
});
