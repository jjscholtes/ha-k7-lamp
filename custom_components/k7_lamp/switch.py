"""Manual mode: the lamp holds its manual levels instead of running the schedule."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .coordinator import K7ConfigEntry, K7Coordinator
from .entity import K7Entity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: K7ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([K7ManualModeSwitch(entry.runtime_data)])


class K7ManualModeSwitch(K7Entity, SwitchEntity):
    _attr_name = "Manual mode"
    _attr_icon = "mdi:hand-back-right"

    def __init__(self, coordinator: K7Coordinator) -> None:
        super().__init__(coordinator, "manual_mode")

    @property
    def is_on(self) -> bool:
        return not self.coordinator.data.auto

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_mode(False)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_mode(True)
