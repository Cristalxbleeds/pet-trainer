use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager};

#[derive(Default)]
struct HotkeyState {
    vk_code: Option<i32>,
    enabled: bool,
}

#[tauri::command]
fn set_native_hotkey(state: tauri::State<'_, Arc<Mutex<HotkeyState>>>, vk_code: Option<i32>, enabled: bool) {
    if let Ok(mut s) = state.lock() {
        s.vk_code = vk_code;
        s.enabled = enabled;
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let hotkey_state = Arc::new(Mutex::new(HotkeyState {
        vk_code: Some(0x20),
        enabled: true,
    }));
    let thread_state = hotkey_state.clone();

    tauri::Builder::default()
        .manage(hotkey_state)
        .invoke_handler(tauri::generate_handler![set_native_hotkey])
        .setup(move |app| {
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem};
                use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

                let show_i = MenuItem::with_id(app, "show", "Show Good Pet Bell :3", true, None::<&str>)?;
                let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

                let mut tray_builder = TrayIconBuilder::new()
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    });

                if let Some(icon) = app.default_window_icon() {
                    tray_builder = tray_builder.icon(icon.clone());
                }
                let _ = tray_builder.build(app)?;
            }

            #[cfg(windows)]
            {
                let app_handle = app.handle().clone();
                std::thread::spawn(move || {
                    use windows_sys::Win32::UI::Input::KeyboardAndMouse::GetAsyncKeyState;
                    let mut was_pressed = false;
                    loop {
                        let (vk, enabled) = {
                            if let Ok(s) = thread_state.lock() {
                                (s.vk_code, s.enabled)
                            } else {
                                (None, false)
                            }
                        };

                        if enabled {
                            if let Some(code) = vk {
                                let state = unsafe { GetAsyncKeyState(code) };
                                let is_pressed = (state as u16 & 0x8000) != 0;
                                if is_pressed && !was_pressed {
                                    let _ = app_handle.emit("native-bell-ring", ());
                                }
                                was_pressed = is_pressed;
                            } else {
                                was_pressed = false;
                            }
                        } else {
                            was_pressed = false;
                        }

                        std::thread::sleep(std::time::Duration::from_millis(25));
                    }
                });
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            #[cfg(desktop)]
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Good Pet Bell");
}
