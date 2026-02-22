using UnityEngine;
using UnityEditor;

public static class CopyAirshipDebugInfo
{
    const string AirshipPackageName = "gg.easy.airship";

    [MenuItem("Airship/Copy Debug Info")]
    public static void CopyDebugInfo()
    {
        string airshipVersion = "unknown";
        foreach (var p in UnityEditor.PackageManager.PackageInfo.GetAllRegisteredPackages())
        {
            if (p.name == AirshipPackageName)
            {
                airshipVersion = p.version;
                break;
            }
        }

        string info = string.Format(
            "CPU: {0}\nGPU: {1}\nUnity: {2}\nDevice: {3}\nDevice type: {4}\nRAM: {5} MB\nAirship: {6}",
            SystemInfo.processorType,
            SystemInfo.graphicsDeviceName,
            Application.unityVersion,
            SystemInfo.deviceModel,
            SystemInfo.deviceType,
            SystemInfo.systemMemorySize,
            airshipVersion
        );
        EditorGUIUtility.systemCopyBuffer = info;
        Debug.Log("Debug info copied to clipboard.");
    }
}