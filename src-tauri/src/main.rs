// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod db;
pub mod source;
pub mod log;
pub mod native;
pub mod search;

use std::{fs, sync::atomic::AtomicBool};

use db::{SqlState, DB};
use ::log::info;
use native::{create_main_window, native_windows};
use search::ToolsSearch;
use source::{ToolsSource, ToolsSourceItem};
use tauri::{App, AppHandle, LogicalSize, Manager, Theme, Window};
use uuid::Uuid;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn append_source(source_type: String, path: String, handle: AppHandle) -> Result<(), String> {
    let json_content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
    let mut tools_source = source::parse_source(&json_content)?;
    tools_source.url = path.to_string().clone();
    tools_source.source_id = Uuid::new_v4().to_string();
    source::save_source(&tools_source, &handle)?;
    Ok(())
}

#[tauri::command]
fn get_all_source(handle: tauri::AppHandle) -> Result<Vec<ToolsSource>, String> {
    let list = source::query_all(&handle)?;
    Ok(list)
}

#[tauri::command]
fn delete_source(handle: tauri::AppHandle, source_ids:Vec<String>) -> Result<(), String> {
    source::delete_source(source_ids, &handle)?;
    Ok(())
}
#[tauri::command]
fn get_source_item(id: String, handle: tauri::AppHandle) -> Result<Vec<ToolsSourceItem>, String> {
    let list = source::query_items(id, &handle)?;
    Ok(list)
}

#[tauri::command]
fn get_source_item_by_id(item_id: i32, handle: tauri::AppHandle) -> Result<Vec<ToolsSourceItem>, String> {
    let list = source::query_items_by_id(item_id, &handle)?;
    Ok(list)
}

#[tauri::command]
fn get_source_items_by_type(tool_type: String, handle: tauri::AppHandle) -> Result<Vec<ToolsSourceItem>, String> {
    let list = source::query_items_by_type(tool_type, &handle)?;
    Ok(list)
}

#[tauri::command]
fn search_tools(keywords: String, handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let result = source::search_tool_items(keywords, &handle)?;
    Ok(result)
}


#[tauri::command]
fn save_local_source_item(source_item: ToolsSourceItem, handle: tauri::AppHandle) -> Result<i32, String> {
    // let source_item = serde_json::from_str(source_item.as_str()).map_err(|err| err.to_string())?;
    let item_id = source::save_local_tool_item(&source_item, &handle)?;
    Ok(item_id)
}

#[tauri::command]
fn show_settings(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("settings") {
        window.show().map_err(|err| err.to_string()).unwrap();
        Ok(())
    } else {
        #[cfg(target_os = "macos")]
        let style = tauri::TitleBarStyle::Overlay;
    
        #[cfg(target_os = "windows")]
        let style = tauri::TitleBarStyle::Visible;

        let setting_window = tauri::WebviewWindowBuilder::new(
            &app,
            "settings", /* the unique window label */
            tauri::WebviewUrl::App("/settings".parse().unwrap()),
        )
        .decorations(true)
        .visible(true)
        .accept_first_mouse(true)
        .hidden_title(true)
        .title_bar_style(style)
        .build()
        .expect("failed to build window");
        
        setting_window
            .set_size(LogicalSize::new(800, 600))
            .expect("failed to set size");
        setting_window
            .set_resizable(false)
            .expect("failed to set resizable");
        
        #[cfg(target_os = "macos")]
        native_windows(&setting_window, None, true);

        setting_window
            .show()
            .map_err(|err| err.to_string())
            .unwrap();
        Ok(())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(SqlState(AtomicBool::new(false)))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup( |app| {
            let _ = db::init_db_conn(&app.handle()).unwrap();
            let _ = search::init_index(&app.handle()).unwrap();
            window_design(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            append_source,
            get_all_source,
            get_source_item,
            delete_source,
            show_settings,
            get_source_item_by_id,
            get_source_items_by_type,
            save_local_source_item,
            search_tools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn window_design(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let _window = create_main_window(&app.handle());
    Ok(())
}