/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Tests the telemetry event for opening the translations panel.
 */
add_task(async function test_translations_telemetry_open_panel() {
  const { cleanup } = await loadTestPage({
    page: SPANISH_PAGE_URL,
    languagePairs: LANGUAGE_PAIRS,
  });

  await TestTranslationsTelemetry.assertEvent(
    "OpenPanel",
    Glean.translationsPanel.open,
    {
      expectedEventCount: 0,
    }
  );

  const { button } = await assertTranslationsButton(
    { button: true },
    "The button is available."
  );

  await waitForTranslationsPopupEvent("popupshown", () => {
    click(button, "Opening the popup");
  });

  await waitForTranslationsPopupEvent("popuphidden", () => {
    click(
      getByL10nId("translations-panel-translate-cancel"),
      "Click the cancel button."
    );
  });

  await TestTranslationsTelemetry.assertEvent(
    "OpenPanel",
    Glean.translationsPanel.open,
    {
      expectedEventCount: 1,
      expectNewFlowId: true,
      finalValuePredicates: [
        value => value.extra.auto_show === "false",
        value => value.extra.view_name === "defaultView",
        value => value.extra.opened_from === "translationsButton",
        value => value.extra.document_language === "es",
      ],
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "CancelButton",
    Glean.translationsPanel.cancelButton,
    {
      expectedEventCount: 1,
      expectNewFlowId: false,
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "ClosePanel",
    Glean.translationsPanel.close,
    {
      expectedEventCount: 1,
      expectNewFlowId: false,
    }
  );

  await waitForTranslationsPopupEvent("popupshown", () => {
    click(button, "Opening the popup");
  });

  await waitForTranslationsPopupEvent("popuphidden", () => {
    click(
      getByL10nId("translations-panel-translate-cancel"),
      "Click the cancel button."
    );
  });

  await TestTranslationsTelemetry.assertEvent(
    "OpenPanel",
    Glean.translationsPanel.open,
    {
      expectedEventCount: 2,
      expectNewFlowId: true,
      allValuePredicates: [
        value => value.extra.auto_show === "false",
        value => value.extra.view_name === "defaultView",
        value => value.extra.opened_from === "translationsButton",
        value => value.extra.document_language === "es",
      ],
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "CancelButton",
    Glean.translationsPanel.cancelButton,
    {
      expectedEventCount: 2,
      expectNewFlowId: false,
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "ClosePanel",
    Glean.translationsPanel.close,
    {
      expectedEventCount: 2,
      expectNewFlowId: false,
    }
  );

  await cleanup();
});
