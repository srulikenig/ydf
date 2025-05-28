Function EncryptUserData(userName As String, password As String, zheut As String, key As String) As String
    Dim json As String
    json = "{""userName"":""" & userName & """,""password"":""" & password & """,""zheut"":""" & zheut & """}"

    Dim encrypted As String
    encrypted = XOR_Encrypt(json, key)
    
    EncryptUserData = UrlSafeBase64(encrypted)
End Function


Function XOR_Encrypt(text As String, key As String) As String
    Dim i As Long, result As String
    For i = 1 To Len(text)
        result = result & Chr(Asc(Mid(text, i, 1)) Xor Asc(Mid(key, ((i - 1) Mod Len(key)) + 1, 1)))
    Next i
    XOR_Encrypt = result
End Function


Function Base64Encode(text As String) As String
    Dim arr() As Byte
    arr = StrConv(text, vbFromUnicode)
    
    Dim objXML As Object
    Set objXML = CreateObject("MSXML2.DOMDocument.6.0")
    
    Dim objNode As Object
    Set objNode = objXML.createElement("b64")
    objNode.DataType = "bin.base64"
    objNode.nodeTypedValue = arr
    Base64Encode = Replace(objNode.Text, vbLf, "")
End Function


Function UrlSafeBase64(text As String) As String
    Dim base64 As String
    base64 = Base64Encode(text)
    
    base64 = Replace(base64, "+", "-")
    base64 = Replace(base64, "/", "_")
    base64 = Replace(base64, "=", "") ' הסר padding
    
    UrlSafeBase64 = base64
End Function
