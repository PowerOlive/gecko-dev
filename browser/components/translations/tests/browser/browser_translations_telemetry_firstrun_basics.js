/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Tests that events in the first panel session are marked as first-interaction events
 * and that events in the subsequent panel session are not marked as first-interaction events.
 */
add_task(async function test_translations_telemetry_firstrun_basics() {
  const { cleanup } = await loadTestPage({
    page: SPANISH_PAGE_URL,
    languagePairs: LANGUAGE_PAIRS,
    prefs: [["browser.translations.panelShown", false]],
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
      expectFirstInteraction: true,
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
      expectFirstInteraction: true,
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "ClosePanel",
    Glean.translationsPanel.close,
    {
      expectedEventCount: 1,
      expectNewFlowId: false,
      expectFirstInteraction: true,
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
      expectFirstInteraction: false,
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
      expectFirstInteraction: false,
    }
  );

  await TestTranslationsTelemetry.assertEvent(
    "ClosePanel",
    Glean.translationsPanel.close,
    {
      expectedEventCount: 2,
      expectNewFlowId: false,
      expectFirstInteraction: false,
    }
  );

  await cleanup();
});
